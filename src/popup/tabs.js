import React from 'react';

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
					{...(this.props.data.historyFullText ? { checked: true } : {})}
					type='checkbox' onChange={(event) => this.props.onChange(event)}></input>
			</label>
		);
		return (
			<div className="setting_tab tab">
				<form className={Tabs.getTab(this.props.tabId)}>
					<label>
						Валидация
						<input
							name="validation"
							{...(this.props.data.validation ? { checked: true } : {})}
							type='checkbox' onChange={(event) => this.props.onChange(event)}></input>
					</label>
					<label>
						Копировать в буфер
						<input
							name="inBuffer"
							{...(this.props.data.inBuffer ? { checked: true } : {})}
							type='checkbox' onChange={(event) => this.props.onChange(event)}></input>
					</label>
					<label>
						Звуковое оповещение
						<input
							name="soundSignal"
							{...(this.props.data.soundSignal ? { checked: true } : {})}
							type='checkbox' onChange={(event) => this.props.onChange(event)}></input>
					</label>
					<label>
						сохранять историю распознования
						<input
							name="history"
							{...(this.props.data.history ? { checked: true } : {})}
							type='checkbox' onChange={(event) => this.props.onChange(event)}></input>
					</label>
					{this.props.data.history ? historyCheck : false}
					<button onClick={(event) => {
						console.log("something change");
						event.preventDefault();
					}}>
						Просмотреть историю
							</button>
					<button onClick={(event) => {
						console.log("something change");
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
							value={JSON.stringify(this.props.data.key)}
							type='text' onChange={(event) => {
								let e = {};
								e.target = {
									name: event.target.name,
									value: JSON.parse(event.target.value),
									type: event.target.type
								}
								// if value is array than run onChange
								if (Array.isArray(e.target.value) && e.target.value.length >= 1) {
									this.props.onChange(e);
								}
							}}
						></input>
						<button onClick={(event) => {
							console.log("something change");
							event.preventDefault();
						}}>
							Изменить клавишу
							</button>
					</label>
					<label>
						Нажатием на кнопку (создаётся кнопка):
						<input
							name="button"
							{...(this.props.data.button ? { checked: true } : {})}
							type='checkbox' onChange={(event) => this.props.onChange(event)}></input>
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
						<input name="scale" value={this.props.data.scale} {...{ ...this.state.props, min: 1 }}></input>
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
				default:
					return <RecognizeTab {...props} />;
					break;
			}
		}
	}

	render() {
		return (
			Tabs.getTab(this.props.tabId, {
				onChange: (event) => { this.props.handleOnChange(event) },
				data: this.props.data,
				tabId: this.props.tabId,
			})
		);
	}
}

export { Tabs };