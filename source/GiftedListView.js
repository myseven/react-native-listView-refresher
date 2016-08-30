'use strict'

import React,{Component} from 'react';

import {
  StyleSheet,
  ListView,
  Platform,
  TouchableHighlight,
  View,
  Text,
  PropTypes,
  ActivityIndicator
} from 'react-native';

// small helper function which merged two objects into one
function MergeRecursive(obj1, obj2) {
  for (var p in obj2) {
    try {
      if ( obj2[p].constructor==Object ) {
        obj1[p] = MergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch(e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}


class GiftedListView extends Component {

  props: {
    paginationFetchigView : PropTypes.func,
    refreshableFetchingView : PropTypes.func,
    isLoadingWhenMounted: boolean,
  }

  static defaultProps = {
    initialListSize: 10,
    firstLoader: true,
    pagination: false,
    refreshable: false,
    refreshableViewHeight: 60,
    refreshableDistance: 45,
    sectionHeaderView: null,
    withSections: false,
    isLoadingWhenMounted: false,
    onFetch : (page, callback, options) => { callback([]); },

    paginationFetchigView : () => {
      return (
        <View style={customStyles.paginationView}>
          <GiftedSpinner />
        </View>
      );
    },
    paginationAllLoadedView:()=> {
      return (
        <View style={customStyles.paginationView}>
          <Text style={customStyles.actionsLabel}>
            ~
          </Text>
        </View>
      );
    },
    paginationWaitingView :(paginateCallback)=> {
      return (
        <TouchableHighlight
          underlayColor='#c8c7cc'
          onPress={paginateCallback}
          style={customStyles.paginationView}
        >
          <Text style={customStyles.actionsLabel}>
            +
          </Text>
        </TouchableHighlight>
      );
    },
    refreshableFetchingView: ()=> {
      return (
        <View style={customStyles.refreshableView}>
          <GiftedSpinner />
        </View>
      );
    },
    refreshableWillRefreshView:()=> {
      return (
        <View style={customStyles.refreshableView}>
          <Text style={customStyles.actionsLabel}>
            ↻
          </Text>
        </View>
      );
    },
    refreshableWaitingView:(refreshCallback)=> {
      if (Platform.OS !== 'android') {
        return (
          <View style={customStyles.refreshableView}>
            <Text style={customStyles.actionsLabel}>
              ↓
            </Text>
          </View>
        );
      } else {
        return (
          <TouchableHighlight
            underlayColor='#c8c7cc'
            onPress={refreshCallback}
            style={customStyles.refreshableView}
          >
            <Text style={customStyles.actionsLabel}>
              ↻
            </Text>
          </TouchableHighlight>
        );
      }
    },
    emptyView:(refreshCallback)=> {
      return (
        <View style={customStyles.defaultView}>
          <Text style={customStyles.defaultViewTitle}>
            Sorry, there is no content to display
          </Text>

          <TouchableHighlight
            underlayColor='#c8c7cc'
            onPress={refreshCallback}
          >
            <Text>
              ↻
            </Text>
          </TouchableHighlight>
        </View>
      );
    },
    renderSeparator:()=> {
      return (
        <View style={customStyles.separator} />
      );
    },
  };

  _setY(y) { this._y = y; }
  _getY(y) { return this._y; }
  _setPage(page) { this._page = page; }
  _getPage() { return this._page; }
  _setRows(rows) { this._rows = rows; }
  _getRows() { return this._rows; }

  constructor (props) {
    super(props);

    if (this.props.refreshable === true && Platform.OS !== 'android') {
      this._setY(this.props.refreshableViewHeight);
    } else {
      this._setY(0);
    }

    this._setPage(1);
    this._setRows([]);
    var ds = null;
    if (this.props.withSections === true) {
      ds = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
        sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
      });
      this.state = {
        dataSource: ds.cloneWithRowsAndSections(this._getRows()),
        refreshStatus: 'NORMAL',
        paginationStatus: 'firstLoad',
        needRender : false,
      }

    } else {
      ds = new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      });
      this.state ={
        dataSource: ds.cloneWithRows(this._getRows()),
        refreshStatus: 'NORMAL',
        paginationStatus: 'firstLoad',
      }
    }

    this.draging = false;
    this.isLoading = false;
  }

  componentDidMount() {
    this._scrollResponder = this.refs.listview.getScrollResponder();
    if (this.props.isLoadingWhenMounted) {
      this.props.onFetch(this._getPage(), this._postRefresh, {firstLoad: true});
      if (!this.props.firstLoadingAnimated) {
        this._scrollResponder.scrollTo({y:60});
      }
    } else {
      this._scrollResponder.scrollTo({y:60});
    }
  }

  render() {
    return (
      <ListView
        contentInset={this._calculateContentInset()}
        {...this.props}
        ref="listview"
        dataSource={this.state.dataSource}
        renderRow={this.props.rowView}
        renderSectionHeader={this.props.sectionHeaderView}
        initialListSize={this.props.initialListSize}
        renderSeparator={this.props.renderSeparator}

        renderHeader={this._renderRefreshView}
        renderFooter={this._renderPaginationView}
        //
        onScroll={this.props.refreshable === true ? this._onScroll : null}
        onScrollEndDrag={()=>{if (this.props.refreshable){
            this._onScrollEndDrag();
        }}}
        onScrollBeginDrag={()=>{if (this.props.refreshable) {
          this._onScrollBeginDrag();
        }}}
        onEndReached={this._onEndReached}
        scrollEventThrottle={200}
        automaticallyAdjustContentInsets={false}
        scrollEnabled={true}
        canCancelContentTouches={true}
        enableEmptySections = {true}
        onEndReachedThreshold={10}
        keyboardShouldPersistTaps={true}
        showsVerticalScrollIndicator={false}
      />
    )
  }

  _onEndReached = () => {
    if ((this.state.paginationStatus === 'NORMAL') && this.props.pagination) {
      this._onPaginate();
    }
  }
  setNativeProps = (props)=> {
    this.refs.listview.setNativeProps(props);
  }

  _refresh = () => {
    this._onRefresh({external: true});
  }

  _onRefresh = (options = {}) => {
    this.isLoading = true;
    this._scrollResponder.scrollTo({y:0});
    this.setState({
      refreshStatus: 'LOADING',
    });
    this._setPage(1);
    this.props.onFetch(this._getPage(), this._postRefresh, options);
  }

  _postRefresh = (rows = [], options = {}) => {
    this.isLoading = false;
    this._updateRows(rows, options);
    if (this.props.refreshable === true) {
      this._scrollResponder.scrollTo({y:this.props.refreshableViewHeight});
    }
  }

  _onPaginate =() => {
    this.isLoading = true;
    this.setState({
      paginationStatus: 'LOADING',
    });
    this.props.onFetch(this._getPage() + 1, this._postPaginate, {});
  }

  _postPaginate = (rows = [], options = {}) => {
    this.isLoading = false;
    this._setPage(this._getPage() + 1);
    var mergedRows = null;
    if (this.props.withSections === true) {
      mergedRows = MergeRecursive(this._getRows(), rows);
    } else {
      mergedRows = this._getRows().concat(rows);
    }
    this._updateRows(mergedRows, options);
  }

  _updateRows = (rows = [], options = {}) => {
    this._setRows(rows);
    if (this.props.withSections === true) {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRowsAndSections(rows),
        refreshStatus: 'NORMAL',
        paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'NORMAL'),
      });
    } else {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(rows),
        refreshStatus: 'NORMAL',
        paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'NORMAL'),
      });
    }
  }

  _onScroll = (e) => {
    this._setY(e.nativeEvent.contentOffset.y);
    let status = this.state.refreshStatus;
    if (this.props.refreshable === true && Platform.OS !== 'android') {
        if (status === 'LOADING') {

        } else if (this.draging) {
            if (status === 'PULLING' && !this.isLoading && this._getY() > 0) {
              this.setState({
                refreshStatus: 'NORMAL',
              });
            } else if (status == 'NORMAL' && this._getY() < 0 && !this.isLoading) {
              this.setState({
                refreshStatus: 'PULLING',
              });
            }
        }
    }
  }

  _onScrollEndDrag(){
    this.draging = false;
    let status = this.state.refreshStatus;
    if (this.props.refreshable === true && Platform.OS !== 'android') {
      console.log(status,this._getY());
      if (status === 'PULLING' || (status == 'NORMAL' && this._getY() < 0 && !this.isLoading)) {
        this._onRefresh();
      }
    }
  }
  _onScrollBeginDrag(){
    this.draging = true;
  }

  _renderRefreshView = () => {
    if (!this.props.refreshable) {
      if (this.props.renderHeader) {
        return this.props.renderHeader();
      }
    }
    switch (this.state.refreshStatus) {
      case 'LOADING':
        return this.props.refreshableFetchingView();
        break;
      case 'PULLING':
        return this.props.refreshableWillRefreshView();
        break;
      default:
        return this.props.refreshableWaitingView(this._onRefresh);
    }
  }

  _renderPaginationView = () => {
    if (!this.pagination) {
      if (this.props.renderFooter) {
        return this.props.renderFooter();
      }
    }
    if (this._getRows().length === 0 && this.props.emptyView) {
      return this.props.emptyView(this._onRefresh);
    }
    if ((this.state.paginationStatus === 'LOADING' && this.props.pagination === true) || (this.state.paginationStatus === 'firstLoad' && this.props.firstLoader === true)) {
      return this.props.paginationFetchigView();
    } else if (this.state.paginationStatus === 'NORMAL' && this.props.pagination === true && (this.props.withSections === true || this._getRows().length > 0)) {
      return this.props.paginationWaitingView(this._onPaginate);
    } else if (this.state.paginationStatus === 'allLoaded' && this.props.pagination === true) {
      return this.props.paginationAllLoadedView();
    } else {
      return null;
    }
  }

  _calculateContentInset = () => {

    if (this.props.refreshable === true && Platform.OS !== 'android') {
      return {top: -1 * this.props.refreshableViewHeight, bottom: 0, left: 0, right: 0};
    } else {
      return {top: 0, bottom: 0, left: 0, right: 0};
    }
  }

  _calculateContentOffset = () => {
    if (this.props.refreshable === true && Platform.OS !== 'android') {
      return {x: 0, y: -1 * this.props.refreshableViewHeight};
    } else {
      return {x: 0, y: 0};
    }
  }
}

var customStyles = StyleSheet.create({

  separator: {
    height: 1,
    backgroundColor: '#CCC'
  },
  refreshableView: {
    height: 50,
    backgroundColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsLabel: {
    fontSize: 20,
  },
  paginationView: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  defaultView: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  defaultViewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
})

class GiftedSpinner extends Component {
  render() {
    return (
      <ActivityIndicator
        animating={true}
        size="small"
        {...this.props}
      />
    );
  }
}

module.exports = GiftedListView;
