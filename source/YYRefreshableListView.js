
'use strict';
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  Dimensions,
  ActivityIndicator,
  PropTypes,
  TouchableHighlight,
  Animated,
  AsyncStorage,
} from 'react-native';
import GiftedListView from './GiftedListView';


type Props = {
  renderRow: (rowData: object, sectionID:number, rowID:number) =>void,
  onFetching : (page:number, callback:()=>void, options:object) =>void,
  pullDownRefreshable: boolean,
  pullUpRefreshable: boolean,
  style:any
};

class YYRefreshableListView extends Component {

  props : Props;

  static defaultProps = {
    pullDownRefreshable: false, // 是否需要下拉刷新
    pullUpRefreshable: false,   // 是否需要加载更多
    firstLoadingAnimated: false,   // 初始化加载是否有动画
    isLoadingWhenMounted: true,  // 初始化是否加载
  };

  componentDidMount = () =>{
    this._updateFetchDate();
  }

  _updateFetchDate = () => {
    let now = new Date().getTime();
    AsyncStorage.setItem(this.prStoryKey, now.toString());
    AsyncStorage.getItem(this.prStoryKey, (error, result) => {
      if (result) {
        result = parseInt(result);
        this.setState({
          prTimeDisplay:dateFormat(new Date(result),'MM-dd hh:mm'),
        });
      } else {
        this.setState({
          prTimeDisplay:dateFormat(new Date(result),'MM-dd hh:mm'),
        });
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      prTimeDisplay:'暂无更新',
    };
    this.prStoryKey = 'prtimekey';
    this.base64Icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQBAMAAAD8TNiNAAAAJ1BMVEUAAACqqqplZWVnZ2doaGhqampoaGhpaWlnZ2dmZmZlZWVmZmZnZ2duD78kAAAADHRSTlMAA6CYqZOlnI+Kg/B86E+1AAAAhklEQVQ4y+2LvQ3CQAxGLSHEBSg8AAX0jECTnhFosgcjZKr8StE3VHz5EkeRMkF0rzk/P58k9rgOW78j+TE99OoeKpEbCvcPVDJ0OvsJ9bQs6Jxs26h5HCrlr9w8vi8zHphfmI0fcvO/ZXJG8wDzcvDFO2Y/AJj9ADE7gXmlxFMIyVpJ7DECzC9J2EC2ECAAAAAASUVORK5CYII=';
  }

  render() {
    return (
      <GiftedListView
          {...this.props}
         ref='yyListView'
         rowView={this.props.renderRow}
         onFetch={this._onFetch}
         firstLoader={false}
         pagination={this.props.pullUpRefreshable}
         refreshable={this.props.pullDownRefreshable}
         refreshableFetchingView={this._refreshableFetchingView}
         refreshableWillRefreshView={this._refreshableWillRefreshView}
         refreshableWaitingView={this._refreshableWaitingView}
         renderFooter={this.props.renderFooter}
         paginationFetchigView={this._renderPaginationFetchigView}
         paginationAllLoadedView={this._renderPaginationAllLoadedView}
         paginationWaitingView={this._renderPaginationWaitingView}
         emptyView={this.props.emptyView ? this.props.emptyView : ()=>{return <View></View>}}
       />
    )
  }

  forceRefresh = ()=> {
    this._updateFetchDate();
    this.refs.yyListView._refresh()
  }
  _onFetch = (page, callback, options) => {
    this._updateFetchDate();
    this.props.onFetching(page, callback, options);
  }
  _refreshableFetchingView = ()=> {
    let external = this.props.renderHeader ? this.props.renderHeader() : null;
    return (
      <View>
        <View style={styles.headerContainer}>
          <View style={styles.indicatorContent}>
            <ActivityIndicator style={styles.indicatorStyle} animated={true}/>
            <Text style={styles.prState}>正在刷新数据中..</Text>
          </View>
          <Text style={styles.prText}>最后更新：{this.state.prTimeDisplay}</Text>
        </View>
        {external}
      </View>
    )
  }

  _refreshableWillRefreshView = ()=>{
    let external = this.props.renderHeader ? this.props.renderHeader() : null;
    return (
      <View>
        <View style={styles.headerContainer}>
          <View style={styles.indicatorContent}>
            <Animated.Image style={[styles.arrowStyle, styles.imageRotate]} resizeMode={'contain'} source={{uri:this.base64Icon}}/>
            <Text style={styles.prState}>释放立即刷新</Text>
          </View>
          <Text style={styles.prText}>最后更新：{this.state.prTimeDisplay}</Text>
        </View>
        {external}
      </View>
    )
  }
  _refreshableWaitingView = ()=>{
    let external = this.props.renderHeader ? this.props.renderHeader() : null;
    return (
      <View>
        <View style={styles.headerContainer}>
          <View style={styles.indicatorContent}>
            <Animated.Image style={styles.arrowStyle} resizeMode={'contain'} source={{uri:this.base64Icon}}/>
            <Text style={styles.prState}>下拉可以刷新</Text>
          </View>
          <Text style={styles.prText}>最后更新：{this.state.prTimeDisplay}</Text>
        </View>
        {external}
      </View>
    )
  }

  _renderPaginationWaitingView = (paginateCallback) => {
    let external = this.props.renderFooter ? this.props.renderFooter() : null;
    return (
      <View>
       {external}
       <View style={styles.paginationView}>
        <ActivityIndicator style={styles.scrollSpinner} />
        <Text style={styles.paginationText}>正在加载更多...</Text>
       </View>
      </View>
    )
   }

   _renderPaginationFetchigView = ()=> {
     let external = this.props.renderFooter ? this.props.renderFooter() : null;
     return (
       <View>
        {external}
        <View style={styles.paginationView}>
         <ActivityIndicator style={styles.scrollSpinner} />
         <Text style={styles.paginationText}>正在加载更多...</Text>
        </View>
       </View>
     )
   }

   _renderPaginationAllLoadedView = () => {
     let external = this.props.renderFooter ? this.props.renderFooter() : null;
     return (
       <View>
        {external}
        <View style={styles.paginationView}>
         <Text style={styles.paginationText}>已全部加载</Text>
        </View>
       </View>
     )
   }
}

const dateFormat = function(dateTime, fmt) {
    var date = new Date(dateTime);
    fmt = fmt || 'yyyy-MM-dd';
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var styles = StyleSheet.create({
    headerContainer: {
      alignItems:'center',
      backgroundColor:'#f2f2f2',
      height: 60,
    },
    text: {
        fontSize:14,
    },
    image: {
        width:15,
        height:40,
        marginRight: 10,
    },
    imageRotate: {
        transform:[{rotateX: '180deg'},],
    },
    activity: {
      marginRight: 10
    },
    paginationView: {
     height: 44,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#f2f2f2',
     flexDirection:'row',
    },
    paginationText: {
      color: '#919191',
    },
    indicatorContent:{
      flexDirection:'row',
      paddingBottom: 5,
      marginTop: 10,
    },
    prState:{
      marginBottom:4,
      fontSize:14,
      fontWeight: 'bold',
      color: 'rgb(90,90,90)',
    },
    arrowStyle : {
      position:'absolute',
      left:-40,
      top:-5,
      width:14,
      height:23,
    },
    indicatorStyle : {
      position:'absolute',
      left:-30,
      top:3,
      width:16,
      height:16
    },
    prText:{
      marginBottom:4,
      fontSize:14,
      fontWeight: 'bold',
      color: 'rgb(90,90,90)',
      paddingBottom: 5,
    },
    scrollSpinner: {
      marginRight: 10,
    },

});
export default YYRefreshableListView;
