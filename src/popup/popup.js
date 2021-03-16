import React from 'react';
import ReactDOM from 'react-dom';
import '@popup/style/index.scss';
import { Tabs } from '@popup/tabs.js';

class SettingInterface extends React.Component {



	constructor(props) {
		super(props);

		this.br = /Firefox/.test(navigator.userAgent) ? browser : chrome;
		this.state = {
			tabId: 1,
			accessSetting: false,
			accessHistory: false
		};

		this.getSettingData();

		this.br.runtime.onMessage.addListener(async (message) => {
			let state = {}
			if (message.message === "settingData") {
				state.settingData = message.data
				state.accessSetting = true;
				this.setState(state);
			}
			if (message.message === "historyData") {
				state.historyData = message.data
				state.accessHistory = true;
				this.setState(state);
			}
		});
	}

	changeTab(tabId) {
		this.setState({ tabId: tabId });
	}
	getChangeData(tabId, event) {
		const target = event.target;
		const name = target.name;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		// creating object {name:value}
		let namedValue = {};
		namedValue[name] = value;
		// add "tab Name" and "namedValue" property in the data object
		let data = this.state.settingData;
		data[Tabs.getTab(tabId)] = { ...data[Tabs.getTab(tabId)], ...namedValue };
		this.setState({ data });
	}
	async saveSetting() {
		this.br.runtime.sendMessage({
			message: "setSettingData",
			data: this.state.settingData
		});
	}
	getSettingData() {
		this.br.runtime.sendMessage({ message: "getSettingData" });
	}
	getHistoryData() {
		this.br.runtime.sendMessage({ message: "getHistoryData" });
	}
	clearHistory() {
		this.br.runtime.sendMessage({ message: "clearHistory" });
	}
	render() {
		if (this.state.accessSetting) {
			let props = { tabId: this.state.tabId, };
			if (this.state.tabId < 4) {
				props = Object.assign(props, {
					data: this.state.settingData[Tabs.getTab(this.state.tabId)],
					onChange: (event) => this.getChangeData(this.state.tabId, event),
				});
				if (this.state.tabId === 3) {
					props = Object.assign(props, {
						changeTab: (id) => this.changeTab(id),
						clearHistory: () => this.clearHistory()
					});
				}
			}
			if (this.state.tabId === 4) {
				props = Object.assign(props, {
					getHistoryData: () => this.getHistoryData(),
					accessHistory: this.state.accessHistory,
					historyData: this.state.historyData,
				});
			}

			return (
				<div className="setting">
					<div className="setting__tab-switch tab-switch">
						<button className={"tab-switch__" + Tabs.getTab(1)} onClick={() => this.changeTab(1)}>Recognize</button>
						<button className={"tab-switch__" + Tabs.getTab(2)} onClick={() => this.changeTab(2)}>Control</button>
						<button className={"tab-switch__" + Tabs.getTab(3)} onClick={() => this.changeTab(3)}>Result</button>
						<button className="tab-switch__save" onClick={() => this.saveSetting()}>Save</button>
					</div>
					<Tabs propsTab={props} />
				</div >
			)
		}
		else {
			return (
				<h1 className={'loading'}>Loading...</h1>
			)
		}
	}
}


ReactDOM.render(
	<SettingInterface />,
	document.querySelector('.App')
);
