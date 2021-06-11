import main from './app.js';

// the entry point for the server application
(() => {
    console.log('Starting bot server...');
    main().catch((e) => {
        console.log(e);
    });
})();
