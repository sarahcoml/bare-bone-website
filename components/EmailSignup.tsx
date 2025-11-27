'use client'
import {useState} from 'react'

export default function EmailSignup(){
  const [email, setEmail] = useState('')
  return (
    <form onSubmit={(e)=>{e.preventDefault(); alert(`Thanks, ${email}`)}} style={{marginTop: '1rem'}}>
      <label>
        <span style={{display:'block'}}>Join our mailing list</span>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" style={{padding:'.5rem', marginRight:'.5rem'}} />
      </label>
      <button type="submit" style={{padding:'.5rem 1rem'}}>Sign up</button>
    </form>
  )
}