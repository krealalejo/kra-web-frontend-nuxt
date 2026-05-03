export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head = html.head.map((chunk) =>
      chunk.replaceAll(
        /<link rel="stylesheet" (href="\/_nuxt\/[^"]*\.css"[^>]*)>/g,
        (_, attrs) =>
          `<link rel="preload" as="style" ${attrs} onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" ${attrs}></noscript>`
      )
    )
  })
})
