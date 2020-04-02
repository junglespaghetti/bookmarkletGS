function onOpen() {
  
  var ui = SpreadsheetApp.getUi();
  
  ui.createMenu(multiLang("Scripts"))
  
    .addItem(multiLang("Bookmarklet settings"), "showBookmarkletSidebar")
  
    .addItem(multiLang("Get bookmarklet"), "popBookmarkletTag")
  
    .addToUi();
}

function getBookmarkletList() {
  
  return PropertiesService.getUserProperties().getProperty("bookmarkletName");
  
}

function getBookmarkletData(name) {
  
  var prop = PropertiesService.getUserProperties();
  
  if (name && prop.getProperty(name)) {
    
    return prop.getProperty(name);
    
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


function doGet(e) {
  
  Logger.log(JSON.stringify(e.parameter));
  
  var param = e.parameter;
  
  var prop = PropertiesService.getUserProperties()
  
  var bookmarklet = prop.getProperty(param.bookmarklet_name);
  
  bookmarklet = bookmarklet ? JSON.parse(bookmarklet): undefined; 
  
  //password origin lock
  
  if(!bookmarklet || param.bookmarklet_password != bookmarklet.password){
    
    return createMessage("Missing or incorrect bookmarklet or password");
    
  }else if(bookmarklet.originLock && bookmarklet.origin != param.origin){

    return createMessage("Missing or incorrect origin url");
           
  }
  
  //sjonp request
  
  if(param.callback && param.request){
   
    return createJsonpRespons(bookmarklet,param)
    
  }
    
}

function createJsonpRespons(bookmarklet,param){
  
  var out = ContentService.createTextOutput();
      
  var request = JSON.parse(decodeURIComponent(param.request));
      
  var responseText = param.callback + "(" + JSON.stringify(requestHandler(request)) + ")";
      
  out.setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  return out.setContent(responseText);

}


function createMessage(message){
  
  var out = ContentService.createTextOutput();
  
  var responseText;
  
  responseText = JSON.stringify({error:multiLang(message)});
  
  out.setMimeType(ContentService.MimeType.JSON);
  
  return out.setContent(responseText);
  
}
