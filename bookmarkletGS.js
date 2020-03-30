function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu(multiLang("Scripts"))
    .addItem(multiLang("Bookmarklet settings"), "showBookmarkletSidebar")
    .addItem(multiLang("Get bookmarklet"), "popBookmarkletTag")
    .addToUi();
}

function showBookmarkletSidebar() {
  var prop = PropertiesService.getUserProperties();
  let html = HtmlService.createTemplateFromFile("html/mookmarkletSetting.html");
  html.bookmarkletLavel = multiLang("Bookmarklet name");
  html.urlLavel = multiLang("This script url");
  html.passwordLavel = multiLang("Script password");
  html.callbackLabel = multiLang("Coallback function");
  html.originLavel = multiLang("Use only origin url");
  html.originLockLabel = multiLang("lock");
  SpreadsheetApp.getUi().showSidebar(
    html.evaluate().setTitle(multiLang("Bookmarklet loader settings"))
  );
}

function popBookmarkletTag(res) {
  var prop = PropertiesService.getUserProperties();
  let html = HtmlService.createTemplateFromFile("html/bookmarklet.html");
  html.bookmarkretDropInfo = multiLang(
    "Drop the following link on the browser toolbar to use it."
  );
  html.selfUrl = res.bookmarkletName;
  html.selfPassword = res.scriptUrl;
  html.userCallback = res.password;
  html.bookmarkletName = res.callback;
  SpreadsheetApp.getUi().showModalDialog(
    html.evaluate(),
    multiLang("Create bookmark")
  );
}


function getBookmarkletList() {
  return PropertiesService.getUserProperties().getProperty("bookmarkletName");
}

function getBookmarkletData(name) {
  if (name && PropertiesService.getUserProperties().getProperty(name)) {
    return PropertiesService.getUserProperties().getProperty(name);
  } else {
    return;
  }
}

function setBookmarkletData(res) {
  var prop = PropertiesService.getUserProperties();
  let bookmarkletNames = prop.getProperty("bookmarkletName");
  if (prop.getProperty("bookmarkletName")) {
    var arr = splitStringArray(
      prop.getProperty("bookmarkletName"),
      res.bookmarkletName
    );
    arr.push(res.bookmarkletName);
    prop.setProperty("bookmarkletName", arr.join(","));
  } else {
    prop.setProperty("bookmarkletName", res.bookmarkletName);
  }
  prop.setProperty(res.bookmarkletName, JSON.stringify(res));
  popBookmarkletTag(res);
  return "update";
}

function deleteBookmarkletData(name) {
  var prop = PropertiesService.getUserProperties();
  if (prop.getProperty("bookmarkletName")) {
    var arr = splitStringArray(prop.getProperty("bookmarkletName"), name);
    prop.setProperty("bookmarkletName", arr.join(","));
  } else if (prop.getProperty("bookmarkletName") == name) {
    prop.deleteProperty("bookmarkletName");
  }
  if (prop.getProperty(name)) {
    prop.deleteProperty(name);
  }
  return "delete";
}

function deltest() {
  var prop = PropertiesService.getUserProperties();
  prop.deleteProperty("bookmarkletName");
}

function splitStringArray(val, name) {
  var arr;
  if ((typeof val == "string" || val instanceof String) && val.match(/,/)) {
    arr = val.split(",");
  } else if (typeof val == "string" || val instanceof String) {
    arr = [val];
  } else if (val instanceof Array) {
    arr = val;
  } else {
    arr = [];
  }
  if (name) {
    return arr.filter(function(a) {
      return a !== name;
    });
  } else {
    return arr;
  }
}

function doGet(e) {
  var text = e.parameter.text;
  var prop = PropertiesService.getUserProperties();

  Logger.log(e.parameter.callback);

  var value;

  if (text) {
    value = "You say " + text;
  } else {
    value = "Please say something!";
  }

  var result = {
    message: value
  };

  var responseText;

  var out = ContentService.createTextOutput();

  var callback = e.parameter.callback;

  if (e.parameter.loader) {
    Logger.log(e.parameter.loader);
    Logger.log(getLoder());
    responseText = getLoder();
    out.setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    if (callback) {
      responseText = callback + "(" + JSON.stringify(result) + ")";
      //Mime Typeをapplication/javascriptに設定
      out.setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      responseText = JSON.stringify(result);
      //Mime Typeをapplication/jsonに設定
      out.setMimeType(ContentService.MimeType.JSON);
    }
  }

  //JSONPテキストをセットする
  out.setContent(responseText);

  return out;
}

function getLoder() {
  let loader =
    "(function(f,d,e,a,c,b){" +
    "d=[" +
    '"https://bookmarlet-gs.glitch.me/js/bookmarklet.js"' +
    "];e=[" +
    '];for(a=0;a<e.length;a++)b=document.createElement("link"),b.type="text/css",b.rel="stylesheet",b.href=e[a],document.body.appendChild(b);for(a=0;a<d.length;a++)c=document.createElement("script"),c.src=d[a],a==d.length-1&&(c.onload=function(){f()}),document.body.appendChild(c)})' +
    "(function(){loadJsonp(gsUrl,scriptParam)});";
  loader +=
    'function loadJsonp(c,a){a.pass=a.pass?a.pass:scriptParam.pass;var b=document.createElement("script");b.src=c+objToParameter(a);document.body.appendChild(b)};';
  loader +=
    'function objToParameter(a){if(a instanceof Object&&!(a instanceof Array)){var b=[];Object.keys(a).forEach(function(c){b.push(c+"="+a[c])});return"?"+b.join("&")}return""};';
  return loader;
}

function multiLang(str) {
  let lang = SpreadsheetApp.getActiveSpreadsheet()
    .getSpreadsheetLocale()
    .substr(0, 2);
  return LanguageApp.translate(str, "", lang);
}
