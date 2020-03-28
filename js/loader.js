(function(f, u,v, i, s,c) {
  for (i = 0; i < v.length; i++) {
    c = document.createElement("link");
    c.type = "text/css";
    c.rel = "stylesheet";
    c.href = v[i];
    document.body.appendChild(c);
    }
  for (i = 0; i < u.length; i++) {
    s = document.createElement("script");
    s.src = u[i];
    if (i == u.length - 1) {
      s.onload = function() {
        f();
      };
    }
    document.body.appendChild(s);
  }
})(function() {
  loadJsonp(gsUrl,scriptParam);
});

function loadJsonp(src,param){
param.pass = param.pass ? param.pass : scriptParam.pass;
  
  var script = document.createElement('script');
  script.src = src + objToParameter(param);
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
