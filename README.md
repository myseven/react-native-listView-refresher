# react-native-listView-refresher
A pull down to refresh and pull up to load more list view. 

**Only for iOS**

ScreenShot:

![pull down image](https://github.com/myseven/react-native-listView-refresher/blob/master/res/pulldown.png)

![pull up image](https://github.com/myseven/react-native-listView-refresher/blob/master/res/pullup.png)

##Usage


You can using npm to install component:

`npm i react-native-listview-refresher`

Simple usage:

```java

import List from 'react-native-listview-refresher';

class demoClass extends Component {
  render() {
    return (
      <View style={styles.container}>
        <List
          ref='listView'
          renderRow={this.renderRow}
          onFetching={this.fetch}
          pullDownRefreshable={true}
          pullUpRefreshable={true}
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

```

