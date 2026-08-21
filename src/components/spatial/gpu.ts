// Hardware WebGL detection, kept in a standalone module so the check can run before
// (and without) importing the heavy three.js bundle.

// Software renderers (SwiftShader, llvmpipe, etc.) draw WebGL on the CPU — that's
// what PageSpeed's emulated desktop and low-end devices use, and where each frame
// costs tens of milliseconds of main-thread time. On those we skip the 3D scene.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|angle \(google/i;

export function hasHardwareWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    ).toLowerCase();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !SOFTWARE_RENDERER.test(renderer);
  } catch {
    return false;
  }
}

export function subscribeGpu() {
  return () => {};
}
