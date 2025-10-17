const eventBus = {
    events: {},
    subscribe(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    },
    publish(event, data) {
        if (!this.events[event]) {
            return;
        }
        this.events[event].forEach(listener => listener(data));
    }
};

export default eventBus;