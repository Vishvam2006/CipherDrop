export function Button({
  children,
  className = '',
  variant = 'primary',
  block = false,
  ...props
}) {
  const classes = ['ui-button', `ui-button--${variant}`, block ? 'ui-button--block' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
