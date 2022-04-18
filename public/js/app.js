import Frontpage from './views/Frontpage.js';
import './aMapper.js';

const router = async () => {
  const routes = [
    { path: '/', view: Frontpage }
  ];
  
  // Test each route for potential match
  const potentialMatches = routes.map( route => {
    return {
      route: route,
      isMatch: location.pathname === route.path
    };
  });
  
  let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);
  
  //Default to dashboard if no match
  if (!match) {
    match = {
      route: routes[0],
      isMatch: true
    };
  };
  
  const view = new match.route.view();
  
  //Load & render content
  //for the sake of viewer we empty the app before we rip the css out
  $('#app').html('');
  $('#app').load(await view.getHtml(), function() {
    render();
  });
};

//Not sure if want to keep this here 
const render = () => {
  includeHTML();
  setSquare();
  scrollToHashLink();
  //future render stuff here
}

const includeHTML = () => {
  const elmnts = $('[include-html]')
  elmnts.each(function() {
    $(this).load($(this).attr('include-html'), function() {
      render();
    });
  });
  elmnts.removeAttr('include-html');
};

const scrollToHashLink = () => {
  const url_string = window.location.href;
  const elemId = url_string.split('#')[1];
  if (elemId){
    $('#'+elemId)[0].scrollIntoView();
  }
};

//Incase I want squares
const setSquare = () => { 
  //css is so powerfull right they said
  $('.square').each( function () {
    $(this).height($(this).width());
  });
};
window.addEventListener('resize', setSquare);

//Browser history navigation
const navigateTo = url => {
  history.pushState(null, null, url);
  router();
};

window.addEventListener('popstate', router);

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  router();
});