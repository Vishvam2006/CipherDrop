export function Card({ children, className = '' }) {
  const classes = ['surface-card', className].filter(Boolean).join(' ')

  return <section className={classes}>{children}</section>
}
