// Using standard Web Response to avoid relying on 'next/server' types

export async function POST(req: Request) {
  const { email, name } = await req.json().catch(() => ({}));

  if (!email || typeof email !== "string") {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Safely access environment via globalThis to avoid "Cannot find name 'process'" TypeScript errors.
  const env = (globalThis as any).process?.env ?? {};
  const API_KEY = env.MAILCHIMP_API_KEY;
  const LIST_ID = env.MAILCHIMP_LIST_ID;
  const SUBSCRIBE_STATUS = env.MAILCHIMP_STATUS ?? "pending";

  if (!API_KEY || !LIST_ID) {
    return new Response(JSON.stringify({ error: "Mailchimp not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Mailchimp API key contains dc (data center) after last dash: e.g. xxxx-us10
  const dc = API_KEY.split("-").pop();
  if (!dc) {
    return new Response(JSON.stringify({ error: "Invalid API key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;

  const body = {
    email_address: email,
    status: SUBSCRIBE_STATUS, // "subscribed" or "pending"
    merge_fields: { FNAME: name || "" },
  };

  const encodeBase64 = (s: string) => {
    if ((globalThis as any).Buffer) {
      return (globalThis as any).Buffer.from(s).toString("base64");
    }
    if (typeof btoa === "function") {
      return btoa(s);
    }
    return "";
  };

  const auth = encodeBase64(`anystring:${API_KEY}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.title || data?.detail || "Mailchimp error";
      return new Response(JSON.stringify({ error: msg, data }), {
        status: res.status || 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}