/* Firebase Analytics — loaded from layout.js on every page */
(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyBhdQVl_G8dBCuBEhA7eARbxPNVdH_Uww8",
    authDomain: "hipobuy-website.firebaseapp.com",
    projectId: "hipobuy-website",
    storageBucket: "hipobuy-website.firebasestorage.app",
    messagingSenderId: "59289522752",
    appId: "1:59289522752:web:13b0f19f4d4b2ff6edc5a5",
    measurementId: "G-7G31893Z2K",
  };

  Promise.all([
    import("https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js"),
  ])
    .then(([firebaseApp, firebaseAnalytics]) => {
      const app = firebaseApp.initializeApp(firebaseConfig);
      return firebaseAnalytics.isSupported().then((ok) => {
        if (ok) firebaseAnalytics.getAnalytics(app);
      });
    })
    .catch(() => {});
})();
