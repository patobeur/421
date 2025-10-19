class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event, payload) {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(payload));
        }
    }
}

export const bus = new EventBus();
