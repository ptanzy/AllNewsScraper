var config = {
    apiKey: "AIzaSyBIZsSFu85PGnuJpFR_cubOwK-INBy5FxU",
    authDomain: "allnewsscraper.firebaseapp.com",
    databaseURL: "https://allnewsscraper.firebaseio.com",
    projectId: "allnewsscraper",
    storageBucket: "allnewsscraper.appspot.com",
    messagingSenderId: "996681927610"
  };
  firebase.initializeApp(config);

  var auth = firebase.auth();

var mynews = false;
var allnews = false;
$(document).ready(function () {
  
    $('#create-user').on('submit', function(event){
      event.preventDefault();
      var userData = {
          email: $('#email').val(),
          password: $('#password').val(),
          username: 0
      };
      auth.createUserWithEmailAndPassword(userData.email, userData.password)
      .then(function(user){
          userData.username = user.user.uid;
          localStorage.setItem('username', user.user.uid.toString());
          $.post("/api/users", userData)
          .then(function() {
            getUsers();
          });
          
      })
      .catch(function(error){
          alert(error);
        });
    
      function getUsers() {
        $.get("/api/users", function(data) {
          var uname = localStorage.getItem("username");
          for (var i=0; i < data.length; i++){
            if (data[i].username == uname){
              localStorage.setItem('userID', data[i].id.toString());
              window.location.href = "/create";
            }
          }
        });
      }
      
    });
  
    $('#sign-in').on('submit', function(event){
      event.preventDefault();
      var email = $('#sign-in-email').val();
      var password = $('#sign-in-password').val();
      auth.signInWithEmailAndPassword(email, password)
      .then(function(user){
          console.log(user);
          localStorage.setItem('userID', user.user.uid);
          window.location.href = "/create"; //redirects user to datasets page
      })
      .catch(function(error){
          alert(error);
      });
      
    });
  
  
    $("#sign-out").on('click', function() {
        auth.signOut();
    });

    $('select').material_select();
    $(".button-collapse").sideNav();
    $('.modal').modal();
    // $('span.activator').mouseover(function(e){
    //     $(this).trigger('click');
    // });
});


$(function(){
    if($('body').is('.mynews') && !mynews){
      mynews = true;
      var user = localStorage.getItem('userID');
      $.getJSON("/articles/mine/"+user, function(data) {
          if(data.type === "error"){
            Materialize.toast('Server Error. Issue finding article. Please try again.', 3000);
            return;
          }
          if(data.length === 0){
            Materialize.toast('MyNews has no article. Add your first article!', 3000)
            return;
          }
          //all of my articles
          printArticlesToTab("#mine", data);
          //all of user articles by Date
          sortArticlesByDate(data)
          printArticlesToTab("#mine-time", data);
      });
    }
});

$(function(){
    if($('body').is('.allnews') && !allnews){
      allnews = true;
      $.getJSON("/articles/all/", function(data) {
        if(data.type === "error"){
          Materialize.toast('Server Error. Issue finding article. Please try again.', 3000);
          return;
        }        
        if(data.length === 0){
          Materialize.toast('AllNews has no article. Be the first to add an article!', 3000)
          return;
        }
        //all of my articles
        printArticlesToTab("#all", data);
        //all of user articles by Date
        sortArticlesByDate(data)
        printArticlesToTab("#all-time", data);
     });
    }
});

function sortArticlesByDate(articles){
    articles.sort(function(a, b) {
        a = parseForDate(a._id);
        b = parseForDate(b._id);
        return a>b ? -1 : a<b ? 1 : 0;
    });
}

function parseForDate(articleId){
    var timestamp = articleId.toString().substring(0,8);
    var date = new Date( parseInt( timestamp, 16 ) * 1000 );
    return date;
}

function printArticlesToTab($tabContainer, data){

    var $container = $($tabContainer);
    var $cards = $();
    for(var i = 0; i<data.length; i++){
        
        var $card = createCommentCard(data[i], i);
        $card.data(data[i]);
        $cards = $cards.add($card);
    }
    $container.append($cards)
        .ready(addCommentCardListeners($cards));
}

$(function(){
    if($('body').is('.stats')){

    }
});
// $("a.btn-floating").on("click", function(){ //a#btn-floating.halfway-fab.waves-effect.waves-light.green.add-card
//   event.stopPropagation();
//   event.stopImmediatePropagation();
//   $(this).removeClass( "add-card green" ).addClass( "red" );
//   var data = this.data();
// });

$('#news-form').submit(function(e) {
    event.preventDefault();
    var $params = {};
    $params.site = $("#news-site").val()
    $params.sort = $("#news-sort").val()
    $params.sdate = $("#startdate").val()
    $params.edate = $("#enddate").val()
    $params.search = $("#search").val()
    var $cards;
    var $btns;
    $.getJSON("/scrape", $params, function(data) {
        var $container = $("#scraped-articles");
        $cards = $();
        $btns = $();
        for(var i = 0; i<data.length; i++){
            data[i].user = localStorage.getItem('userID');
            var $card = createArticleCard(data[i], i);
            $card.data(data[i]);
            $cards = $cards.add($card);
            var $btn = $card.find("a.add-card");
            $btns = $btns.add($btn);
        }
        $container.append($cards)
    }).then(function(){
        addClickListinerToCardButtons($btns);
    });
});

function addClickListinerToCardButtons(els){
    var elems = Array.prototype.slice.call(els);

    // Now, you can safely use .forEach()
    elems.forEach(function(el) {
        // Callbacks are passed a reference to the event object that triggered the handler
        el.addEventListener("click", function(evt) {
            // The this keyword will refer to the element that was clicked
            var $me = $(this);
            $me.removeClass( "green" ).addClass( "disabled" );
            var $card = $me.closest(".article-card");
            var data = $card.data();
            var $container = $("#comment-articles");

            // $.ajax({
            //   method: "POST",
            //   url: "/article",
            //   data: data,
            //   success: onPostArticle
            // });

            // function onPostArticle(resp) {
            //     // Log the response
            //     data = resp._id;
            //     console.log(resp);
            // }

            $.post("/article", data)
            .done(
             function(resp){
                 // do something when response is ok
                 if(resp.type === "error"){
                    var $newCard = createCommentCard(resp);
                    Materialize.toast('Server Error: Article not added. Try again.', 3000);
                    $container.append($newCard);
                    return;
                 }
                 data._id = resp._id;
                 var $newCard = createCommentCard(data);
                 $newCard.data(data);
                 Materialize.toast('Article Added and Ready For Comments!', 2000);
                 $container.append($newCard)
                     .ready(addCommentCardListeners($newCard));
                 console.log(resp);
              }
            ).fail(
             function(resp){
                   console.log("Fail: "+resp);
              }
          );

            // With that done
            //   .then(function(data) {
            //       // Log the response
            //       console.log(data);
            //   });


            //console.log(this.id, el); 
        });
    })
}

function addCommentCardListeners($commentCard){
    var data = $commentCard.data();
    var $buttonCreate = $commentCard.find("a.comment-card");
    $buttonCreate[0].addEventListener("click", function(evt) {
        $(this).trigger('click');
        var $comments = $commentCard.find("div.comment-section");
        var $inputExists = $commentCard.find("form.comment-input");
        if(!$inputExists.length){
            var $input = createCommentInput();
            $comments.append($input)
                .ready(addCommentInputSubmitListeners($input, $commentCard));
        }
    });
    var $buttonView = $commentCard.find("a.activator");
    $buttonView[0].addEventListener("click", function(evt) {
        $(this).trigger('click');
    });
    var $buttonClose = $commentCard.find("i.close-comments");
    $buttonClose[0].addEventListener("click", function(evt) {
        var $comments = $(this).closest("div.comment-section");
        var $inputField = $comments.find("form.comment-input");
        $inputField.remove();
    });
    var $buttonDelete = $commentCard.find("i.delete-article");
    $buttonDelete[0].addEventListener("click", function(evt) {
        var $commentCard = $(this).closest("div.comments");
        $.ajax({
            url: "/delete/article/"+data._id,
            type: 'GET',
            success: function(result) {
                $commentCard.remove();
            }, 
            failure: function(resp){
              console.log("Fail: "+resp);
              Materialize.toast('Server Error: Article not deleted. Try again.', 3000)
            }
        });
        // $.get("/delete/article/"+data._id)
        //   .done(
        //    function(resp){
        //        // do something when response is ok
        //        $commentCard.remove();
        //     }
        //   ).fail(
        //    function(resp){
        //          console.log("Fail: "+resp);
        //          Materialize.toast('Server Error: Article not deleted. Try again.', 3000)
        //     }
        //   );
 
    });
};

function addCommentInputSubmitListeners($input, $commentCard){
  var $commentForm = $input.find("form.comment-input");
  $commentForm[0].addEventListener("submit", function(evt) {
      event.preventDefault();
      debugger;
      var data = $commentCard.data();
      var $params = {};
      var articleId = data._id;
      var user = localStorage.getItem('userID');
      $params.articleId = articleId;
      $params.header = $(".comment-header").val();
      $params.body = $(".materialize-textarea").val();



      $.post("/comment/"+articleId+"/"+user, $params)
         .done(
          function(resp){
              if(resp.type === "error"){
                  Materialize.toast(`Server Error: ${resp.name} ${resp.message} 
                      Try again to add a comment.`, 3000);
                  return;
              }
              // do something when response is ok
              var $nocomments = $commentCard.find("p.no-comments");
              if($nocomments.length){
                  var $commentSet = createCollapsibleCommentSet($params);
                  $nocomments[0].replaceWith($commentSet[0])
                  //.ready( ( $('.collapsible').collapsible() )() );
                  $('.collapsible').collapsible()
                  addCommentSegmentListiners($commentCard);
              }else{
                  var $commentSet = $commentCard.find("ul.collapsible");
                  var $commentSegment = createCollapsibleCommentSegment($params);
                  $commentSet.append($commentSegment);
                  addCommentSegmentListiners($commentCard);
              }
              console.log(resp);
           }
         ).fail(
          function(resp){
              Materialize.toast(`Server failed to respond.
                      Try again to add a comment.`, 3000);
           }
       );
      //TODO figure out how to add error handling with the then and data arg

      function addCommentSegmentListiners($commentCard){
        var data = $commentCard.data();
        var $commentDelete = $commentCard.find("i.delete-comment");
        $commentDelete[0].addEventListener("click", function(evt) {
            var $commentSeg = $(this).closest("li.comment-seg");
            $.ajax({
                url: "/delete/comment/"+data._id,
                type: 'GET',
                success: function(result) {
                    $commentSeg.remove();
                }, 
                failure: function(resp){
                  console.log("Fail: "+resp);
                  Materialize.toast('Server Error: Article not deleted. Try again.', 3000)
                }
            });

     
        });
      }      

  });
}

function createCollapsibleCommentSet(data){
  var commentSet = `
    <ul class="collapsible" data-collapsible="accordion">
      <li class="comment-seg">
        <div class="collapsible-header">${data.header}<i class="material-icons right delete-comment">clear</i></div>
        <div class="collapsible-body"><span>${data.body}</span></div>
      </li>
    </ul>
  `
  return $(commentSet);
}

function createCollapsibleCommentSegment(data){
  var commentSet = `
      <li class="comment-seg">
        <div class="collapsible-header">${data.header}<i class="material-icons right delete-comment">clear</i></div>
        <div class="collapsible-body"><span>${data.body}</span></div>
      </li>
  `
  return $(commentSet);
}

function createCommentInput(){
    var comment = `
        <div class="row">
          <form class="comment-input col s12">
            <div class="row">
              <div class="input-field col s10">
               <input placeholder="Header" type="text" class="comment-header validate required">
                <label for="first_name">Header</label>
              </div>
              <button class="waves-effect waves-teal btn-flat btn-large col s2 submit-comment" type="submit">Comment
                <i class="material-icons right">comment</i>
              </button>
            </div>
            <div class="row">
              <div class="input-field col s12">
                <textarea class="materialize-textarea"></textarea>
                <label for="textarea1">Comment</label>
              </div>
              
            </div>
          </form>
        </div>
    `
    return $(comment);
}

function createArticleCard(data, i){

    var cardTemplate = `
        <div class="col s12 article-card">
          <div class="card horizontal">
            
    `;
    if(data.img){
        cardTemplate += `
            <div class="card-image">
                <img src="${data.img} width="300" height="300">
            </div>`
    }  //onclick="addToCommentSection()
    cardTemplate += `          
            <div class="card-stacked">
              <div class="card-content">
              <a class="btn-floating halfway-fab waves-effect waves-light green add-card"><i class="material-icons">add</i></a> 
                <span class="card-title">${data.title}</span>
                <p>${data.body}</p>
              </div>
              <div class="card-action">
                <a href="${data.siteUrl}" target="_blank">${data.siteName}</a>
                <a href="${data.siteUrl+data.link}" target="_blank">Read Article</a>
              </div>
            </div>
          </div>
        </div>
    `
    return $(cardTemplate);
}

function createCommentCard(data, i){
    if(data.type === "error"){
        data.title = "Error: "+data.name;
        data.body = data.message+"\nComments disabled";
        data.siteUrl = "#";
        data.link = "";
        data.title = ""
    }
    cardTemplate = `
        <div class="card medium white comments">
            <div class="card-content black-text">
                <a class="btn-floating halfway-fab waves-effect waves-light blue activator comment-card"><i class="material-icons">comment</i></a>
                <span class="card-title"><i class="material-icons right delete-article">close</i>${data.title}</span>
                <p>${data.body}</p>
            </div>
            <div class="card-action">
                <a href="${data.siteUrl+data.link}" target="_blank">Read Article</a>
                <a class="activator">View Comments</a>
            </div>
            <div class="card-reveal comment-section">
                <span class="card-title grey-text text-darken-4"><i class="material-icons right close-comments">close</i>${data.title}</span>
                <div class="comment-group empty-group">
                    <p class="no-comments">This article does not have a comment yet.</p>
                </div>
          </div>
        </div>
    `
    return $(cardTemplate);

    // var cardTemplate = `

    //       <div class="card horizontal article-card">
            
    // `;
    // if(data.img){
    //     cardTemplate += `
    //         <div class="card-image">
    //             <img src="${data.img} width="300" height="300">
    //         </div>`
    // }  //onclick="addToCommentSection()
    // cardTemplate += `          
    //         <div class="card-stacked">
    //           <div class="card-content">
    //             <a class="btn-floating halfway-fab waves-effect waves-light blue comment-card"><i class="material-icons">comment</i></a> 
    //             <span class="card-title">${data.title}</span>
    //             <p>${data.body}</p>
    //           </div>
    //           <div class="card-action">
    //             <a href="${data.siteUrl}" target="_blank">${data.siteName}</a>
    //             <a href="${data.siteUrl+data.link}" target="_blank">Read Article</a>
    //             <a class="activator">View Comments</a>
    //           </div>
    //           <div class="card-reveal">
    //             <span class="card-title grey-text text-darken-4">${data.title}<i class="material-icons right">close</i></span>
    //             <p>This article does not currently have a comment</p>
    //           </div>
    //         </div>
    //       </div>
    // `
    // return $(cardTemplate);
}


// function addToCommentSection(el){
//   var $me = $(el);
//   $me.removeClass( "green" ).addClass( "red" );
//   var $card = $me.closest(".article-card");
// }
// $('#startdate').pickadate({
//     selectMonths: true,
//     selectYears: 15,
//     onSet: setMaxDate
//   });
  
// $('#enddate').pickadate({
//   selectMonths: true,
//   selectYears: 15,
//   onOpen: setMaxDate
// });

// function setMaxDate(obj){
// debugger;
//   var val = new Date().toLocaleDateString("en-US");
//   // picker1.set('min', val.startOf('quarter').toDate());
//   obj.set('max', val, { format: 'M/dd/yyyy' });
  
//   if( obj.clear ){
//       // picker1.set('min', false);
//       obj.set('max', false);
//   }
// }