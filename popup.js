bookmarks = {

  /**
  *   FAVICON_URL_REGEX = ファビコン画像を表示させるための正規表現。
  *   本拡張機能では、ChromeAPIを使って最近のブックマークのURLと記事タイトルを取得している。
  *   しかし、ファビコンを表示させるためにはURLの中でもhost部分のみを抜き出して、
  *   <img src="example.com">のように書く必要があるので、正規表現を用意した。
  */
  FAVICON_URL_REGEX: /(^https?:\/\/(www[.])?([0-9a-zA-Z.-]+)).*$/gi,

  /**
  *  settingButtonFlag = 設定画面を表示させるために「設定」ボタンをクリックする必要があるが、
  *                      settingButtonFlag変数を用意していないと、
  *                      設定画面が開いてすぐに閉じると言う不具合が生じてしまうため。
  */
  settingButtonFlag: true,

  /**
  *   bookmarkSetting = ブックマーク表示の初期設定
  *   num   = 表示するブックマークの数
  *   alert = ブックマークを削除する時にアラートを表示させるかどうか。trueで表示。
  */
  bookmarkSetting = {
    num: 25,
    alert: true
  },

  initTransrate: function() {
    document.getElementById("alert_message_setting").textContent =
       chrome.i18n.getMessage("bookmarkNumbers");

    document.getElementById("label-message").textContent =
      chrome.i18n.getMessage("alert_message_setting");

    document.getElementById("change-setting").textContent =
      chrome.i18n.getMessage("change_button");

    document.getElementById("setting-translate").textContent =
      chrome.i18n.getMessage("setting_button");
  },

  getRecentBookmarks: function() {
    bookmarks.getBookmarkSetting();
    chrome.bookmarks.getRecent(bookmarks.bookmarkSetting.num,
      bookmarks.handleGetRecentResponse);
  },

  getBookmarkSetting: function() {
    if (!localStorage['bookmarks']) {
      localStorage['bookmarks'] = JSON.stringify(bookmarks.bookmarkSetting);
    } else {
      bookmarks.bookmarkSetting = JSON.parse(localStorage['bookmarks']);
    }
  },

  handleGetRecentResponse: function(response) {
    bookmarks.createBookmarkList(response);

    let setting = $("#setting");
    let edit_area = $('#edit-area');

    setting.on("click", function() {
      bookmarks.showSettingArea(setting, edit_area);
    });

    let change_setting = $('#change-setting');

    change_setting.on("click", function() {
      bookmarks.changeBookmarkSetting();
    });
  },

  createBookmarkList: function(response) {
    let wrap = $("#bookmark-area");
    wrap.empty();

    for (let i = 0, length = response.length; i < length; i++) {
      let pattern = bookmarks.createBookmarkPattern(response[i]);
      wrap.append(pattern);
    }
  },

  createBookmarkPattern: function(response) {
    let id = response.id;
    let url = response.url;
    let title = response.title;

    let hostLink = url.replace(bookmarks.FAVICON_URL_REGEX, '$3');

    let outer = $('<div class="bookmark-section"></div>')

    let bookmarkLink = $('<a href="' + url + '" target="_blank" class="bookmark-link">' +
      '</a>');

    let bookmarkLinkWrap = $('<div class="bookmark-section-left"></div>');

    let favicon = $('<div class="favi-box">' +
      '<img src="https://www.google.com/s2/favicons?domain=' +
      hostLink + '">' +
      '</div>');

    let bookmarkTextLink = $('<div class="bookmark-text"><span>' +
      title +
      '</span></div>');

    let removeButton = $('<div class="button-div" title="Delete the bookmark">' +
      '<i class="far fa-trash-alt"></i>' +
      '</div>');
    bookmarkLinkWrap.append(favicon);
    bookmarkLinkWrap.append(bookmarkTextLink);
    bookmarkLink.append(bookmarkLinkWrap);

    outer.append(bookmarkLink);
    outer.append(removeButton);

    removeButton.on("click", function() {
      bookmarks.removeBookmark(id, outer);
    });

    return outer;
  },

  removeBookmark: function(bookmarkId, hostlink) {
    if (bookmarks.bookmarkSetting.alert) {
      let confirmMessage = chrome.i18n.getMessage("confirmDelete");
      let result = confirm(confirmMessage);
      if (result) {
        chrome.bookmarks.remove(bookmarkId, function() {
          hostlink.slideUp("slow");
        });
      };
    } else {
      chrome.bookmarks.remove(bookmarkId, function() {
        hostlink.slideUp("slow");
      });
    };
    return false;
  },

  showSettingArea: function(setting, edit_area) {
    if (bookmarks.settingButtonFlag) {
      $("#number-bookmark").val(bookmarks.bookmarkSetting.num);

      if (bookmarks.bookmarkSetting.alert) {
        $("#alert-bookmark").prop("checked", true);
      }

      edit_area.slideDown('500');
      setting.html('<i class="fas fa-times"></i> ' +
                   chrome.i18n.getMessage("back_button"));
      bookmarks.settingButtonFlag = false;
    } else {
      edit_area.slideUp('500');
      setting.html('<i class="fas fa-cog"></i> ' +
                   chrome.i18n.getMessage("setting_button"));
      bookmarks.settingButtonFlag = true;
    };
  },

  changeBookmarkSetting: function() {
    let number_bookmark = $('#number-bookmark').val();
    let alert_bookmark = $('#alert-bookmark');

    if (number_bookmark != "") {
      bookmarks.bookmarkSetting.num = Number(number_bookmark);
    }

    if (alert_bookmark.prop("checked")) {
      bookmarks.bookmarkSetting.alert = true;
    } else {
      bookmarks.bookmarkSetting.alert = false;
    }

    localStorage['bookmarks'] = JSON.stringify(bookmarks.bookmarkSetting);

    chrome.bookmarks.getRecent(bookmarks.bookmarkSetting.num,
      bookmarks.createBookmarkArea);

    let showMessage = document.createElement('p');
    showMessage.style.cssText = 'background:#dff0d8;color:#3c763d;padding:10px;';
    showMessage.innerHTML = chrome.i18n.getMessage("complete_changed");
    let edit_area = document.getElementById("edit-area");
    edit_area.appendChild(showMessage);
    setTimeout(function() {
      showMessage.style.display = "none";
    }, 2000);
  }

};

bookmarks.initTransrate();
document.addEventListener("load", function(){
  bookmarks.getRecentBookmarks();
},false);
