// import ArcComponent from './arc';
import TreeComponent from './Tree';
class Start {
  constructor(_dispatcher, _data) {
    this.dispatcher = _dispatcher;
    this.data = _data;
    this.filterTargets = []
    this.init();
  }

  init() {
    // Global objects let data; Initialize dispatcher that is used to orchestrate
    // events
    const dispatcher = this.dispatcher;

    /*
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
    */

    this.treeComponent = new TreeComponent({
      parentElement: '#treechart',
      containerWidth: 1100,
      containerHeight: 750,
      margin: {
        top: 10,
        right: 50,
        bottom: 20,
        left: 100
      }
    }, dispatcher, this.data, this.filterTargets);
    this
      .treeComponent
      .updateVis();
  }

  setTargets(_filterTargets, _source) {
    this.filterTargets = _filterTargets;
    this.source = _source;
    this
      .treeComponent
      .updateVis(this.filterTargets, this.source)
  }
}

export default Start;
