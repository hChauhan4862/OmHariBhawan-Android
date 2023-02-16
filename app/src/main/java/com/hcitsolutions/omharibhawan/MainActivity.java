package com.hcitsolutions.omharibhawan;
import android.app.Activity;
        import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.text.Html;
import android.util.Log;
        import android.view.KeyEvent;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
        import android.webkit.WebSettings;
        import android.webkit.WebStorage;
        import android.webkit.WebView;
        import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.RequiresApi;

public class MainActivity extends Activity {
    public class WebAppInterface {
        Context mContext;
        /** Instantiate the interface and set the context */
        WebAppInterface(Context c) {
            mContext = c;
        }

        /** Show a toast from the web page */
        @JavascriptInterface
        public void showToast(String message, String color) {
            Toast.makeText(mContext, message, Toast.LENGTH_SHORT).show();
            Toast toast = Toast.makeText(MainActivity.this,  Html.fromHtml("<font color='white' ><b>" + message + "</b></font>"), Toast.LENGTH_LONG);
            toast.getView().setBackgroundColor(Color.parseColor(color));
            toast.show();
        }
        @JavascriptInterface
        public  void deviceInfo(){
            Log.i("TAG", "SERIAL: " + Build.SERIAL);
            Log.i("TAG","MODEL: " + Build.MODEL);
            Log.i("TAG","ID: " + Build.ID);
            Log.i("TAG","Manufacture: " + Build.MANUFACTURER);
            Log.i("TAG","brand: " + Build.BRAND);
            Log.i("TAG","type: " + Build.TYPE);
            Log.i("TAG","Hardware: " + Build.HARDWARE);
            Log.i("TAG","TIME: " + Build.TIME);
            Log.i("TAG","user: " + Build.USER);
            Log.i("TAG","BASE: " + Build.VERSION_CODES.BASE);
            Log.i("TAG","INCREMENTAL " + Build.VERSION.INCREMENTAL);
            Log.i("TAG","BOARD: " + Build.BOARD);
            Log.i("TAG","BRAND " + Build.BRAND);
            Log.i("TAG","HOST " + Build.HOST);
            Log.i("TAG","FINGERPRINT: "+Build.FINGERPRINT);
            Log.i("TAG","Version Code: " + Build.VERSION.RELEASE);
        }
    }
    WebView webview;
    @RequiresApi(api = Build.VERSION_CODES.JELLY_BEAN)
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webview = (WebView) findViewById(R.id.webView);
        webview.setWebViewClient(new HelloWebViewClient());
        webview.addJavascriptInterface(new WebAppInterface(this), "Android");
        webview.loadUrl("file:///android_asset/index.html");
        WebSettings settings = webview.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setPluginState(WebSettings.PluginState.ON);

        String databasePath = this.getApplicationContext().getDir("database", Context.MODE_PRIVATE).getPath();
        settings.setDatabasePath(databasePath);
        webview.setWebChromeClient(new WebChromeClient() {
            public void onExceededDatabaseQuota(String url, String databaseIdentifier, long currentQuota, long estimatedSize, long totalUsedQuota, WebStorage.QuotaUpdater quotaUpdater) {
                quotaUpdater.updateQuota(5 * 1024 * 1024);
            }
        });
    }

    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && webview.canGoBack()) {
            webview.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
    private class HelloWebViewClient extends WebViewClient {
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }
    }
}