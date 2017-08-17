var gettingAllCommands = browser.commands.getAll();
gettingAllCommands.then((commands) => {
  for (let command of commands) {
    console.log(command);
  }
});

function onError(error){
  console.log('Error: ${error}');
};

browser.commands.onCommand.addListener((command) => {
  console.log("onCommand event received for message: ", command);
  if(command == "reload-all-bcast-storm"){
    //let windows_promise = browser.windows.getAll({ windowTypes: ["normal"] });
    let windows_promise = browser.windows.getAll();

    function onTabs(tabs){
      for(let tab of tabs){
        //console.log(tab.title);
        browser.tabs.reload(tab.id, { bypassCache: true });
        //setTimeout(() => {
        //  let url = tab.url;
        //  console.log('reloading ', url);
        //  browser.tabs.reload(tab.id, { bypassCache: true });
        //  //console.log('setting to none on ', url);
        //  //tab.url = 'about:none';
        //  //setTimeout(() =>{
        //  //  tab.url = url;
        //  //  console.log('reloading ', url);
        //  //});
        //});
      }
    };
    function onWindows(windows){
      for(let win of windows){
        console.dir(browser.tabs);
        let tabs_promise = browser.tabs.query({ windowId: win.id });
        tabs_promise.then(onTabs, onError);
      }
    };
    windows_promise.then(onWindows, onError);
  }else if(command == "reload-all-sequential"){
    console.log("command received!");
    //let windows_promise = browser.windows.getAll({ windowTypes: ["normal"] });
    let windows_promise = browser.windows.getAll();
    let start = Date.now();
    let wini = 0;
    let windows = null;
    let windowscomplete = 0;

    function onTabs(tabs){
        tabi = 0;
        generator = function(){
            console.log("tabindex = ", tabi);
            tab = tabs[tabi];
            console.log("loaded ", tabi, " ", tab.title, " position ", tab.index);
            tabi++;
            if(tabi < tabs.length){
              tab = tabs[tabi];
              console.log("reloading", tabi, " ", tab.title, " position ", tab.index);
              browser.tabs.update(tab.id, {'active': true});
              browser.tabs.reload(tab.id, { bypassCache: true });
            }else if(tabi == tabs.length){
              wini++;
              if(wini == windows.length - 1){
                end = Date.now();
                console.log("total sequential reload time", end);
              }else{
                onWindow();
              }
            }else{
              console.log("tabi = ", tabi);
            }
        };

        tab = tabs[tabi];
        console.log("otabi = ", tabi);
        browser.webNavigation.onCompleted.addListener(generator);
        //browser.tabs.update(tab.id, {'active': true});
        //browser.tabs.reload(tab.id, { bypassCache: true });
    };
    function onWindow(){
      win = windows[wini];
      let tabs_promise = browser.tabs.query({ windowId: win.id });
      tabs_promise.then(onTabs, onError);
    }
    function onWindows(_windows){
      windows = _windows;
      onWindow();
    };
    windows_promise.then(onWindows, onError);
  }else if(command=="halt-all-tabs"){
    let windows_promise = browser.windows.getAll();
    console.dir(window);
    function onTabs(tabs){
      tabs.forEach(function(tab, i){
        //console.log("halt-tab ", i, " ", tab.title, " position ", tab.index);
        setTimeout(() => {
          let url = tab.url;
          console.log("halting ", i, " ", tab.title, " position ", tab.index);
          browser.tabs.update(tab.id, {'active': true});
          window.stop();
        });
      });
    };
    function onWindows(windows){
      for(let win of windows){
        console.dir(browser.tabs);
        let tabs_promise = browser.tabs.query({ windowId: win.id });
        tabs_promise.then(onTabs, onError);
      }
    };
    windows_promise.then(onWindows, onError);
  }
});
