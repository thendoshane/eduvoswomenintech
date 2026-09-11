import React from 'react'
import { reportError } from '../lib/dataService'

export default class ErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={hasError:false,error:null,reported:false}}
  static getDerivedStateFromError(error){return{hasError:true,error}}
  componentDidCatch(error,info){reportError(error,'application',{componentStack:info?.componentStack||''}).catch(()=>{})}
  async report(){try{await reportError(this.state.error,'application')}catch{}this.setState({reported:true})}
  render(){
    if(!this.state.hasError)return this.props.children
    return <main className="fatal-error-page"><div className="fatal-error-card"><span className="eyebrow">Women in Tech Summit</span><h1>We could not load this section.</h1><p>Please refresh once. If the issue continues, send a report to the event team.</p>{this.state.reported?<strong>Report sent.</strong>:<button className="btn btn-white" onClick={()=>this.report()}>Report issue</button>}</div></main>
  }
}
