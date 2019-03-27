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

    $.getJSON("/scrape", $params, function(data) {
        var $container = $("#scraped-articles");
        var $cards = $();
        for(var i = 0; i<data.length; i++){
            data[i].user = localStorage.getItem('userID');
            var $card = createArticleCard(data[i], i);
            $card.data(data[i]);
            $cards = $cards.add($card);
        }
        $container.append($cards)
    }).then(addClickListinerToCardButtons);
});

function addClickListinerToCardButtons(){
    var elems = Array.prototype.slice.call(document.querySelectorAll("a.add-card"));

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
            var $newCard = createCommentCard(data);

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
                 data._id = resp._id;
                 console.log(resp);
              }
            ).fail(
             function(resp){
                   
              }
          );

            // With that done
            //   .then(function(data) {
            //       // Log the response
            //       console.log(data);
            //   });

            $newCard.data(data);
            Materialize.toast('Article Added and Ready For Comments!', 2000)
            $container.append($newCard)
                .ready(addCommentCardListeners($newCard));
            //console.log(this.id, el); 
        });
    })
}

function addCommentCardListeners($commentCard){
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
        $params.header = $(".comment-header").val();
        $params.body = $(".materialize-textarea").val();

        // // Run a POST request to change the note, using what's entered in the inputs
        // $.ajax({
        //     method: "POST",
        //     url: "/comment/"+articleId+"/"+user,
        //     data: $params,
        //     success: onPostComment
        // });

        // function onPostComment(resp) {
        //     // Log the response
        //     console.log(resp);
        // }

        $.post("/comment/"+articleId+"/"+user, $params)
           .done(
            function(resp){
                // do something when response is ok
                console.log(resp);
             }
           ).fail(
            function(resp){

             }
         );
        //TODO figure out how to add error handling with the then and data arg

        var $nocomments = $commentCard.find("p.no-comments");
        if($nocomments.length){
            var $commentSet = createCollapsibleCommentSet($params);
            $nocomments[0].replaceWith($commentSet[0])
            //.ready( ( $('.collapsible').collapsible() )() );
            $('.collapsible').collapsible()
        }else{
            var $commentSet = $commentCard.find("ul.collapsible");
            var $commentSegment = createCollapsibleCommentSegment($params);
            $commentSet.append($commentSegment);
        }
        // var $comments = $(this).closest("div.comment-section");
        // var $inputField = $comments.find("div.comment-input");
        // $inputField.remove();
    });
}

function createCollapsibleCommentSet(data){
    var commentSet = `
      <ul class="collapsible" data-collapsible="accordion">
        <li>
          <div class="collapsible-header">${data.header}</div>
          <div class="collapsible-body"><span>${data.body}</span></div>
        </li>
      </ul>
    `
    return $(commentSet);
}

function createCollapsibleCommentSegment(data){
    var commentSet = `
        <li>
          <div class="collapsible-header">${data.header}</div>
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
    cardTemplate = `
        <div class="card medium white">
            <div class="card-content black-text">
                <a class="btn-floating halfway-fab waves-effect waves-light blue activator comment-card"><i class="material-icons">comment</i></a>
                <span class="card-title">${data.title}</span>
                <p>${data.body}</p>
            </div>
            <div class="card-action">
                <a href="${data.siteUrl+data.link}" target="_blank">Read Article</a>
                <a href="#" class="activator">View Comments</a>
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