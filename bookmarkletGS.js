function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu(multiLang("Scripts"))
    .addItem(multiLang("Bookmarklet settings"), "showBookmarkletSidebar")
    .addItem(multiLang("Get bookmarklet"), "popBookmarkletTag")
    .addToUi();
}

//Bookmarklet Setting form

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
  html.selfUrl = res.scriptUrl;
  html.selfPassword = res.password;
  html.bookmarkletName = res.bookmarkletName;
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
    return JSON.stringify({scriptUrl:ScriptApp.getService().getUrl()});
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
//  Logger.log(prop.getProperty(res.bookmarkletName));
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

//Bookmarklet doget

function doGet(e) {
  Logger.log(JSON.stringify(e.parameter));
  var bookmarklet = PropertiesService.getUserProperties().getProperty(e.parameter.bookmarklet_name);
  bookmarklet = bookmarklet ? JSON.parse(bookmarklet): undefined; 
  var out = ContentService.createTextOutput();
  var responseText;
  if(!bookmarklet || e.parameter.bookmarklet_password != bookmarklet.password){  
    responseText = JSON.stringify({error:multiLang("Missing or incorrect bookmarklet or password")});
    out.setMimeType(ContentService.MimeType.JSON);
    out.setContent(responseText);
    return out;
  }else if(bookmarklet.originLock && bookmarklet.origin != e.parameter.origin){
    responseText = JSON.stringify({error:multiLang("Missing or incorrect origin url")});
    out.setMimeType(ContentService.MimeType.JSON);
    out.setContent(responseText);
    return out;       
  }
  bookmarklet.parameter = {};
  var callback = e.parameter.callback;

  if (e.parameter.loader) {
    if(!bookmarklet.originLock){
    bookmarklet.origin = e.parameter.origin
    PropertiesService.getUserProperties().setProperty(bookmarklet.bookmarkletName, JSON.stringify(bookmarklet))
    }
    if(bookmarklet.callback){bookmarklet.parameter.callback = bookmarklet.callback}
     responseText = getLoder(bookmarklet);
    out.setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    if (callback && bookmarklet.callback == callback) {
      responseText = callback + "(" + JSON.stringify(bookmarklet) + ")";
      out.setMimeType(ContentService.MimeType.JAVASCRIPT);
    }else if(callback && e.parameter.request){
        Logger.log(JSON.stringify(e.parameter.request));
        responseText = callback + "(" + JSON.stringify(requestAction(e.parameter.request)) + ")";
      out.setMimeType(ContentService.MimeType.JAVASCRIPT);
    }else if(callback){
      responseText = callback + "(" + JSON.stringify({}) + ")";
      out.setMimeType(ContentService.MimeType.JAVASCRIPT);      
    } else {
      responseText = JSON.stringify({});
      out.setMimeType(ContentService.MimeType.JSON);
    }
  }

  out.setContent(responseText);

  return out;
    
}

function requestAction(request){
  request = request ? JSON.parse(decodeURIComponent(request)) : "";
  if(!request.action){
    return {};
  }
  
  var respons = {test:"test"};
  
  switch( request.action ) {
    case 'get':
        
        break;

    case 'post':
        
        break;

    case 'put':
        
        break;

    case 'delete':
        
        break;
}
  return respons;
  
}

//loader & compiled fanction

function getLoder(bookmarklet) {
  let loader =
    "(function(f,d,e,a,c,b){" +
    "d=[" + loaderList(bookmarklet.cdnList) +
    "];e=[" + loaderList(bookmarklet.cssList) +
    '];for(a=0;a<e.length;a++)b=document.createElement("link"),b.type="text/css",b.rel="stylesheet",b.href=e[a],document.body.appendChild(b);for(a=0;a<d.length;a++)c=document.createElement("script"),c.src=d[a],a==d.length-1&&(c.onload=function(){f()}),document.body.appendChild(c)})' +
    "(function(){loadJsonp("+ JSON.stringify(bookmarklet) +")});";
  loader +=
    'function loadJsonp(a){a.originLock&&(a.parameter.origin=location.hostname,a.origin!=location.hostname&&alert("missing origin url"));a.parameter.bookmarklet_name=a.parameter.bookmarklet_name?a.parameter.bookmarklet_name:a.bookmarkletName;a.parameter.bookmarklet_password=a.parameter.bookmarklet_password?a.parameter.bookmarklet_password:a.password;Object.keys(a.parameter).forEach(function(b){a.parameter[b]instanceof Array?a.parameter[b]=encodeURIComponent(a.parameter[b].join(",")):a.parameter[b]instanceof' +  
    ' Object&&(a.parameter[b]=encodeURIComponent(JSON.stringify(a.parameter[b])))});var c=document.createElement("script");c.src=a.scriptUrl+objToParameter(a.parameter);document.body.appendChild(c)};';
  loader +=
    'function objToParameter(a){if(a instanceof Object&&!(a instanceof Array)){var b=[];Object.keys(a).forEach(function(c){b.push(c+"="+a[c])});return"?"+b.join("&")}return""};';
  return loader;
}

function loaderList(val){
  var arr = splitStringArray(val);
  if(arr.length > 0){
    return '"' + arr.join('","') + '"';
  }else{
    return ""
  }
}

//

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

function multiLang(str) {
  let lang = SpreadsheetApp.getActiveSpreadsheet()
    .getSpreadsheetLocale()
    .substr(0, 2);
  return LanguageApp.translate(str, "", lang);
}

//****** loader include fanction ******
//*1 parameter in array is camma split & encodeURIComponent
//*2 parameter in object is jason string & encodeURIComponent
//google Closure CompilerREST API (use simple compile)


function loadJsonp(obj){
  if(obj.originLock){obj.parameter.origin = location.hostname;if(obj.origin != location.hostname){alert("missing origin url");};};
     obj.parameter.bookmarklet_name = obj.parameter.bookmarklet_name ? obj.parameter.bookmarklet_name : obj.bookmarkletName;
     obj.parameter.bookmarklet_password =  obj.parameter.bookmarklet_password ? obj.parameter.bookmarklet_password : obj.password;
     Object.keys(obj.parameter).forEach(function (key) {
       if(obj.parameter[key] instanceof Array){
         obj.parameter[key] = encodeURIComponent(obj.parameter[key].join(","));       //*1
       }else if(obj.parameter[key] instanceof Object){
         obj.parameter[key] = encodeURIComponent(JSON.stringify(obj.parameter[key])); //*2
       };
     });
  var script = document.createElement('script');
  script.src = obj.scriptUrl + objToParameter(obj.parameter);
  document.body.appendChild(script);
}

function objToParameter(obj){
  if(obj instanceof Object && !(obj instanceof Array)){
    var arr = [];
    Object.keys(obj).forEach(function (key){
      arr.push(key+"="+obj[key]);
    })
    return "?"+arr.join("&");
  }
  return "";
}
