import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor() {
    super();
    this.setTitle('aMapper - Browser based Ai affinity mapper tool');
  }
  
  async getHtml() {
    $('#app').attr('class', 'frontpage');
    return '/public/views/Frontpage.html';
  }
}