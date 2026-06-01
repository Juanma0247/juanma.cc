export interface NavSection {
  id: string
  label: string
  href: string
  featherIcon: string
}

export const SECTIONS: NavSection[] = [
  { id: 'home',     label: 'Home',     href: '/',         featherIcon: 'home' },
  { id: 'projects', label: 'Projects', href: '/projects', featherIcon: 'folder' },
  { id: 'tools',    label: 'Tools',    href: '/tools',    featherIcon: 'tool' },
  { id: 'scripts',  label: 'Scripts',  href: '/scripts',  featherIcon: 'code' },
  { id: 'contact',  label: 'Contact',  href: '/contact',  featherIcon: 'message-circle' },
  { id: 'games',    label: 'Games',    href: '/games',    featherIcon: 'pie-chart' },
]
