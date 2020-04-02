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
  
  html.bookmarkletName = res.bookmarkletName;
  
  html.cdnList = loaderList(res.cdnList);
  
  html.cssList = loaderList(res.cssList);
  
  html.callback = res.callback;
  
  html.bookmarklet = JSON.stringify(res);
  
  SpreadsheetApp.getUi().showModalDialog(
    
    html.evaluate(),
    
    multiLang("Create bookmark")
    
  );
}

//setting function



//loader & compiled fanction

function loaderList(val){
  
  var arr = splitStringArray(val);
  
  if(arr.length > 0){
    
    return '"' + arr.join('","') + '"';
    
  }else{
    
    return ""
    
  }
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

function getLoder(bookmarklet) {
  let loader =
    "(function(f,d,e,a,c,b){" +
    "d=[" +
    loaderList(bookmarklet.cdnList) +
    "];e=[" +
    loaderList(bookmarklet.cssList) +
    '];for(a=0;a<e.length;a++)b=document.createElement("link"),b.type="text/css",b.rel="stylesheet",b.href=e[a],document.body.appendChild(b);for(a=0;a<d.length;a++)c=document.createElement("script"),c.src=d[a],a==d.length-1&&(c.onload=function(){f()}),document.body.appendChild(c)})' +
    "("+ functionName +"(function(){retrun new jsonpLoader("+ param +")})();";
  loader +=
    'function loadJsonp(a){a.originLock&&(a.parameter.origin=location.hostname,a.origin!=location.hostname&&alert("missing origin url"));a.parameter.bookmarklet_name=a.parameter.bookmarklet_name?a.parameter.bookmarklet_name:a.bookmarkletName;a.parameter.bookmarklet_password=a.parameter.bookmarklet_password?a.parameter.bookmarklet_password:a.password;Object.keys(a.parameter).forEach(function(b){a.parameter[b]instanceof Array?a.parameter[b]=encodeURIComponent(a.parameter[b].join(",")):a.parameter[b]instanceof' +
    ' Object&&(a.parameter[b]=encodeURIComponent(JSON.stringify(a.parameter[b])))});var c=document.createElement("script");c.src=a.scriptUrl+objToParameter(a.parameter);document.body.appendChild(c)};';
  loader +=
    'function objToParameter(a){if(a instanceof Object&&!(a instanceof Array)){var b=[];Object.keys(a).forEach(function(c){b.push(c+"="+a[c])});return"?"+b.join("&")}return""};';
  return loader;
}

class jsonpLoader {
  
  constructor(obj){
    
    this.url = obj.scriptUrl;
    
    this.name = obj.bookmarkletName;
    
    this.password = obj.password;
    
    this.callback = obj.callback;
    
    this.origin = location.hostname;
    
    this.originLock = obj.originLock;
    
    this.request = {};
    
    this.parameterUrl = this.url + 
      
      "?bookmarklet_name=" + this.name +
        
        "&bookmarklet_password=" + this.password +
          
          "&bookmarklet_callback=" + this.callback +
            
            "&origin=" + this.origin +
              
              "&request=" + encodeURIComponent(JSON.stringify(this.request));
    
  }
  
  
}

function loaderList(val) {
  var arr = splitStringArray(val);
  if (arr.length > 0) {
    return '"' + arr.join('","') + '"';
  } else {
    return "";
  }
}


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
