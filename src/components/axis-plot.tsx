'use client';
import {useMemo} from 'react';
import type {ExecutionTrace} from '@/lib/algorithms';
export function AxisPlot({trace,step=Infinity,mini=false}:{trace:ExecutionTrace;step?:number;mini?:boolean}){
 const {config}=trace; const w=mini?720:900,h=mini?190:260,pad=mini?35:54;const x=(n:number)=>pad+(n-config.min)/(config.max-config.min)*(w-pad*2);const visible=trace.events.slice(0,step);const points=[trace.start,...visible.map(e=>e.to)];
 const requests=useMemo(()=>config.queue.map((v,id)=>({v,id})),[config.queue]);const served=new Set(visible.filter(e=>e.type==='service').flatMap(e=>e.requestIds));
 const path=visible.map((e,i)=><line key={i} x1={x(e.from)} y1={mini?92:119} x2={x(e.to)} y2={mini?92:119} stroke={e.type==='wraparound'?'#f49b67':e.type==='boundary'?'#97a9b1':'#68d4c7'} strokeWidth={mini?2:3} strokeDasharray={e.type==='wraparound'?'7 6':e.type==='boundary'?'2 5':undefined} opacity={.88}/>);
 return <div className={'axis-wrap'+(mini?' mini':'')}><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Cylinder axis from ${config.min} to ${config.max}, head at ${points.at(-1)}, ${trace.serviceOrder.length} requests serviced`}>
  {[0,.25,.5,.75,1].map((r,i)=>{const val=Math.round(config.min+(config.max-config.min)*r);return <g key={i}><line x1={x(val)} y1={mini?40:54} x2={x(val)} y2={mini?140:185} stroke="#d9e2df" strokeDasharray="2 5"/><text x={x(val)} y={mini?162:215} textAnchor="middle" className="axis-label">{val}</text></g>})}
  <line x1={pad} x2={w-pad} y1={mini?92:119} y2={mini?92:119} stroke="#b8c6c5" strokeWidth="1.5"/>{path}
  {requests.map(({v,id})=>{const peers=requests.filter(r=>r.v===v);const ordinal=peers.findIndex(r=>r.id===id);const offset=(ordinal-(peers.length-1)/2)*(mini?8:11);const cy=(mini?92:119)+offset;return <g key={id}><line x1={x(v)} x2={x(v)} y1={mini?75:95} y2={mini?109:141} stroke={served.has(id)?'#69b4aa':'#264754'} strokeWidth="1.5"/><circle cx={x(v)} cy={cy} r={mini?4:5.5} fill={served.has(id)?'#68d4c7':'#213f4b'} stroke={served.has(id)?'#68d4c7':'#52707a'} strokeWidth="1.5"/></g>})}
  <circle cx={x(points.at(-1)!)} cy={mini?92:119} r={mini?7:9} fill="#f49b67" stroke="#fff" strokeWidth="2"/><path d={`M ${x(points.at(-1)!)-5} ${mini?60:79} L ${x(points.at(-1)!)+5} ${mini?60:79} L ${x(points.at(-1)!)} ${mini?70:89} Z`} fill="#f49b67"/>
  {!mini&&<><text x={pad} y="30" className="plot-note">REQUEST CYLINDERS</text><text x={w-pad} y="30" textAnchor="end" className="plot-note">HEAD · {points.at(-1)}</text></>}
  {mini&&<text x={pad} y="26" className="plot-note">HEAD PATH · CYLINDERS 0—199</text>}
 </svg></div>
}
