function doGet(e) {

    var text = e.parameter.text;
  
    Logger.log(e.parameter.callback);

    var value;

    if (text) {
        value = "You say " + text;
    } else {
        value = "Please say something!";
    }

    var result = {
        message: value
    }

    var responseText;

    var out = ContentService.createTextOutput();

    var callback = e.parameter.callback;
  
  if(e.parameter.loader){
    Logger.log(e.parameter.loader);
    Logger.log(getLoder());
    responseText = getLoder();
    out.setMimeType(ContentService.MimeType.JAVASCRIPT);
    
  }else{

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

function getLoder(){
  var loader = '(function(f,d,e,a,c,b){' +
  'd=['+'"https://easy-indexeddb.glitch.me/js/dbBookmarklet.js"' +
  '];e=['+  
  '];for(a=0;a<e.length;a++)b=document.createElement("link"),b.type="text/css",b.rel="stylesheet",b.href=e[a],document.body.appendChild(b);for(a=0;a<d.length;a++)c=document.createElement("script"),c.src=d[a],a==d.length-1&&(c.onload=function(){f()}),document.body.appendChild(c)})' +
  '(function(){loadJsonp(gsUrl,scriptParam)});';
  loader += 'function loadJsonp(c,a){a.pass=a.pass?a.pass:scriptParam.pass;var b=document.createElement("script");b.src=c+objToParameter(a);document.body.appendChild(b)};';
  loader += 'function objToParameter(a){if(a instanceof Object&&!(a instanceof Array)){var b=[];Object.keys(a).forEach(function(c){b.push(c+"="+a[c])});return"?"+b.join("&")}return""};';
 return loader;
}
