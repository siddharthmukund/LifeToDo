package app.lifetodo;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Enable Chrome remote debugging: connect via chrome://inspect on desktop
        WebView.setWebContentsDebuggingEnabled(true);
        // Load the English locale entry point directly, bypassing the index.html redirect
        // which can be unreliable in Android WebView
        new Handler(Looper.getMainLooper()).post(() ->
            getBridge().getWebView().loadUrl("https://localhost/en/")
        );
    }
}
