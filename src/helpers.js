export const webViewSendMessage = (message = {}) => {
  // <-- minimal documentation -->
  // flutter JavascriptChannel name 'LeafletWebview'
  // flutter app will react to this event in Webview, check JavascriptChannel method in flutter app
  // eslint-disable-next-line no-undef
  // @ts-ignore
  if (window.ReactNativeWebView)
    // @ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify(message))
}