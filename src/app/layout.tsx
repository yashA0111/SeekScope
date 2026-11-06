import type { Metadata } from 'next';
import './globals.css';
import { SiteNav } from '@/components/site-nav';
import { MotionConfig } from 'framer-motion';
export const metadata:Metadata={title:'SeekScope — See every seek. Understand every schedule.',description:'An interactive laboratory for learning, simulating, and comparing HDD disk scheduling algorithms.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><MotionConfig reducedMotion="user"><SiteNav/>{children}</MotionConfig></body></html>}
