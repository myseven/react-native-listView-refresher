# react-native-listView-refresher
A pull down to refresh and pull up to load more list view. 

> **Important**: Thanks [Farid Safi](https://github.com/FaridSafi) 's Library [react-native-gifted-listview](https://github.com/FaridSafi/react-native-gifted-listview). Because it changed to RefreshControl when update to version 0.0.3, so I changed the source code for appply my use condition.
> 

**Be Careful, this library is Only for iOS plateform**

ScreenShot:

![pull down image](http://ac-jtctxmmk.clouddn.com/e7d4fc1a64823a0a.png)

![pull up image](http://ac-jtctxmmk.clouddn.com/40ed19393fffeb40.png)

## At First

- This library is simple to use, but without more custom config refresh header and load more footer, this will be changed after update.
- The header or footer is part of list view `Header` or `footer`,you can alse add custom header or footer view to the list view.
- The library is cached list view datasource, we don't need care about the page number and merge every page datasource.
- We can use `onFetching` function to fetch data and notify the library finish load then pass to the request page data.


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

##Props

You can use this like list view component, any props will be pass to inner list view.

| name  | description  | default |
|:------------- |:---------------:| -------------:|
| pullDownRefreshable |  can be pull down to refresh | false |
| pullUpRefreshable | can be pull up to load more | false |
| renderRow | same as list view property | null |
| onFetching | loading data, prototype: `(page:number, callback:(data , {allLoaded: false})=>void, options:object) =>void` allLoaded means whether have more data in the list  | null |
| * |other list view property | null |


##Changelog
- v1.0.0 
	- initialize project