import React from 'react';
import keyPress from "@js/keyPress.js";

class ResultTab extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		let historyCheck = (
			<label>
				сохранять полную версию текста
				<input
					name="historyFullText"
					{...(this.props.data.historyFullText ? { checked: true } : { checked: false })}
					type='checkbox'
					onChange={(event) => this.props.onChange(event)}></input>
			</label>
		);
		return (
			<div className="setting_tab tab">
				<form className={Tabs.getTab(this.props.tabId)}>
					<label>
						Валидация
						<input
							name="validation"
							{...(this.props.data.validation ? { checked: true } : { checked: false })}
							type='checkbox'
							onChange={(event) => this.props.onChange(event)}></input>
					</label>
					<label>
						Копировать в буфер
						<input
							name="inBuffer"
							{...(this.props.data.inBuffer ? { checked: true } : { checked: false })}
							type='checkbox'
							onChange={(event) => this.props.onChange(event)}></input>
					</label>
					<label>
						Звуковое оповещение
						<input
							name="soundSignal"
							{...(this.props.data.soundSignal ? { checked: true } : { checked: false })}
							type='checkbox'
							onChange={(event) => this.props.onChange(event)}></input>
					</label>
					<label>
						сохранять историю распознования
						<input
							name="history"
							{...(this.props.data.history ? { checked: true } : { checked: false })}
							type='checkbox'
							onChange={(event) => this.props.onChange(event)}></input>
					</label>
					{this.props.data.history ? historyCheck : false}
					<button onClick={(event) => {
						this.props.changeTab(4);
						event.preventDefault();
					}}>
						Просмотреть историю
							</button>
					<button onClick={(event) => {
						this.props.clearHistory();
						event.preventDefault();
					}}>
						Очистить историю
							</button>
				</form>
			</div >
		)
	}
}
class ControlTab extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="setting_tab tab">
				<form className={Tabs.getTab(this.props.tabId)}>
					<h3>Cпособ активации</h3>
					<label>
						Соченатие клавиш:
						<input
							name="key"
							className="tab__keyList"
							value={JSON.stringify(this.props.data.key)}
							type='text'
							onChange={(event) => {
								let e = {};
								e.target = {
									name: "key",
									value: JSON.parse(event.target.value),
									type: event.target.type
								}
								// if value is array than run onChange
								if (Array.isArray(e.target.value) && e.target.value.length >= 1) {
									this.props.onChange(e);
								}
							}}
						></input>
						<button
							className="tab__key-button"
							onClick={(event) => {
								let thisButtom = event.target;
								thisButtom.innerText = "Нажмите сочетание клавиш";
								let start = true; // skip first click
								// if the counts of key smaller than the new count key, then the event will be removed
								let keyCount = 0;
								let handler = (event) => {
									if (event.detail.name === "newKey") {
										let arrKey = event.detail.keyPress;
										if (arrKey.length > keyCount && thisButtom && !start) {
											keyCount = arrKey.length;
											document.querySelector('.tab__keyList').value = JSON.stringify(arrKey);
											let e = {}
											e.target = {
												name: "key",
												value: arrKey,
												type: "text"
											}
											this.props.onChange(e);
										}
										else if (start) start = false;
										else {
											document.removeEventListener("changeKeyPress", handler);
											key.deleteTracking();
											thisButtom.innerText = "Изменить клавишу";
										}
									}
								}
								// tracking pressed key
								let key = new keyPress("newKey", { returnKey: true });
								key.tracking();
								document.addEventListener("changeKeyPress", handler);
								event.preventDefault();
							}}>
							Изменить клавишу
							</button>
					</label>
				</form>
			</div>
		)
	}

}
class RecognizeTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			props: {
				type: "number",
				onChange: (event) => this.props.onChange(event),
				min: 0,
				max: 100,
			}
		}
	}
	render() {
		return (
			<div className="setting_tab tab">
				<form className={Tabs.getTab(this.props.tabId)}>
					<label>
						Маштобирование:
						<input
							name="lang"
							type='text'
							className='lang'
							value={this.props.data.lang}
							onChange={(event) => this.props.onChange(event)}
						></input>
					</label>
					<label>
						Маштобирование:
						<input
							name="scale"
							value={this.props.data.scale}
							{...{ ...this.state.props, min: 1, max: 5 }}
						></input>
					</label>
					<label>
						Достоверность Символа:
						<input name="confidenceSymbol" value={this.props.data.confidenceSymbol} {...this.state.props}></input>
					</label>
					<label>
						Достоверность Слова:
						<input name="confidenceWord" value={this.props.data.confidenceWord} {...this.state.props}></input>
					</label>
					<label>
						Достоверность Строки:
						<input name="confidenceLine" value={this.props.data.confidenceLine} {...this.state.props}></input>
					</label>
					<label>
						Достоверность Текста:
						<input name="confidenceText" value={this.props.data.confidenceText} {...this.state.props}></input>
					</label>
				</form>
			</div >
		)
	}
}
class HistoryTab extends React.Component {
	constructor(props) {
		super(props);
		this.props.getHistoryData();
	}

	render() {
		if (this.props.accessHistory) {
			let tagList = this.props.historyData.map((el) => {
				// return full text (or message about equality) or nothing
				let getFullText = (el) => {
					let full = "";
					if (el.hasOwnProperty("fullText")) {
						if (el.fullText !== true) {
							full = el.fullText;
						}
						else {
							full = "Text = Full Text"
						}
					}
					return full;
				}
				let fullText = getFullText(el);
				// return li
				return <li className={Tabs.getTab(this.props.tabId) + "__item"} key={el.date} >
					<br></br>Text:<br></br>
					{el.text}
					{fullText ? <br></br> : ''}
					{fullText ? <hr></hr> : ''}
					{fullText ? "Full Text:" : ''}
					{fullText ? <br></br> : ''}
					{fullText ? fullText : ''}
					<br></br><hr></hr><hr></hr>
				</li>
			})

			return (
				<div className={Tabs.getTab(this.props.tabId)}>
					<ul className={Tabs.getTab(this.props.tabId) + "__list"}>{tagList}</ul>
				</div >
			);
		}
		else {
			return (<h1 className={'loading'}>Loading...</h1>);
		}
	}
}
class Tabs extends React.Component {
	constructor(props) {
		super(props);
	}
	static getTab(tabId, props = false) {
		if (props === false) {
			switch (tabId) {
				case 1:
					return "recognize";
					break;
				case 2:
					return "control";
					break;
				case 3:
					return "result";
					break;
				case 4:
					return "history";
					break;
				default:
					return "recognize";
					break;
			}
		}
		else {
			switch (tabId) {
				case 1:
					return <RecognizeTab {...props} />;
					break;
				case 2:
					return <ControlTab {...props} />;
					break;
				case 3:
					return <ResultTab {...props} />;
					break
				case 4:
					return <HistoryTab {...props} />;
					break
				default:
					return <RecognizeTab {...props} />;
					break;
			}
		}
	}

	render() {
		return (
			Tabs.getTab(this.props.propsTab.tabId, this.props.propsTab)
		);
	}
}

export { Tabs };

/*
{
				onChange: (event) => { this.props.handleOnChange(event) },
				data: this.props.data,
				tabId: this.props.tabId,
				changeTab: (id) => { this.props.changeTab(id) },
				getHistoryData: () => { this.props.getHistoryData() },
				accessHistory: this.props.accessHistory,
				historyData: this.props.historyData
			}
*/