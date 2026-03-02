package app.lifetodo;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/**
 * MainActivity — Capacitor entry point.
 *
 * Capacitor's BridgeActivity sets up the WebView, registers all installed
 * plugins, and handles the native ↔ JS bridge. No boilerplate needed here
 * unless we add a custom native plugin or override lifecycle events.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Handle intent if launched via a share or deep link
        handleIncomingIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingIntent(intent);
    }

    /**
     * If this Activity was started via android.intent.action.SEND (share from
     * another app), forward the text to the WebView via a JS event so the
     * shareReceiver.ts hook can pick it up.
     */
    private void handleIncomingIntent(Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        String type   = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && "text/plain".equals(type)) {
            String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
            if (sharedText != null && bridge != null) {
                // Dispatch to JS layer once the WebView is ready
                bridge.getWebView().post(() ->
                    bridge.getWebView().evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('androidShareReceived'," +
                            "{detail:{text:" + escapeJs(sharedText) + "}}));",
                        null
                    )
                );
            }
        }
    }

    /** Minimal JS string escaping (newlines + quotes). */
    private static String escapeJs(String s) {
        return "'" + s.replace("\\", "\\\\")
                      .replace("'", "\\'")
                      .replace("\n", "\\n")
                      .replace("\r", "\\r") + "'";
    }
}
