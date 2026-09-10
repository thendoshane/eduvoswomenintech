import React, { useEffect, useState } from 'react'
import AdminLogin from '../admin/AdminLogin'
import AdminDashboard from '../admin/AdminDashboard'
import { observeAuth } from '../lib/dataService'

export default function AdminPage(){
  const [user,setUser]=useState(undefined)
  useEffect(()=>observeAuth(setUser),[])
  if(user===undefined)return <div className="admin-auth-loading">Checking admin access…</div>
  return user?<AdminDashboard user={user}/>:<AdminLogin/>
}
