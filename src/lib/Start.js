import * as d3 from 'd3';
import ArcComponent from './arc';
class Start {
  constructor(_dispatcher, _data) {
    this.dispatcher = _dispatcher;
    this.data = _data;
    this.init();
  }

  init() {
    // Global objects let data; Initialize dispatcher that is used to orchestrate
    // events
    const dispatcher = this.dispatcher;

    const arcComponent = new ArcComponent({
      parentElement: '#arcchart',
      containerWidth: 1300,
      containerHeight: 500,
      margin: {
        top: 10,
        right: 50,
        bottom: 20,
        left: 100
      }
    }, dispatcher, this.data);
    arcComponent.updateVis();
  }
}

export default Start;
