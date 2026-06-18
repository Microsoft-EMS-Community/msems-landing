declare module "iframe-resizer/js/iframeResizer" {
  const iframeResize: (
    options: Record<string, unknown>,
    target: HTMLElement | string,
  ) => HTMLIFrameElement[];
  export default iframeResize;
}
