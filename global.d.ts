// global.d.ts — add at project root
declare module '*.css'
declare module '*.scss'
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}
declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}