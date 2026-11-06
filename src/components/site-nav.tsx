'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Activity, Menu, X} from 'lucide-react';
import {useState} from 'react';
const links=[['Lab','/lab'],['Learn','/learn'],['Compare','/compare']];
export function SiteNav(){const path=usePathname();const[open,setOpen]=useState(false);return <header className="nav"><Link href="/" className="brand" aria-label="SeekScope home"><span className="brand-mark"><Activity size={17}/></span><span>seek<span className="brand-light">scope</span></span></Link><button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label={open?'Close menu':'Open menu'}>{open?<X/>:<Menu/>}</button><nav className={open?'nav-links is-open':'nav-links'}>{links.map(([name,url])=><Link key={url} onClick={()=>setOpen(false)} className={path===url?'active':''} href={url}>{name}</Link>)}<Link onClick={()=>setOpen(false)} className="nav-cta" href="/lab">Open the lab <span>↗</span></Link></nav></header>}
