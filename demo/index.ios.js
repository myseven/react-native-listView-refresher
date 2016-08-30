/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import List from 'react-native-listview-refresher';

class react_native_listView_refresher extends Component {
  render() {
    return (
      <View style={styles.container}>
        <List
          ref='listView'
          renderRow={this.renderRow}
          onFetching={this.fetch}
          pullDownRefreshable={true}
          pullUpRefreshable={true}
          // renderFooter={()=>{return <View style={{height:50, width:200,backgroundColor:'red'}}><Text>djsiaujdiusajduisu</Text></View>}}
          // renderHeader={()=>{return <View styxle={{height:50, width:200,backgroundColor:'red'}}><Text>djsiaujdiusajduisu</Text></View>}}
        />
      </View>
    );
  }

  fetch = (page = 1, callback, options)=> {
    setTimeout(() => {
        callback(['1','2','3','4','5','6'],{allLoaded: false});
      }, 1000);
  }

  renderRow = (data,sectionID,rowID) => {
    return <Cell key={rowID} rowID={rowID}/>
  }
}


class Cell extends Component {
  render() {
    return(
      <View style={{height: 100, width: 300}}>
        <Text>index {this.props.rowID}</Text>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('react_native_listView_refresher', () => react_native_listView_refresher);
