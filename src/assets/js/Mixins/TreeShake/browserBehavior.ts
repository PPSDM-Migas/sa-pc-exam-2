const changeDarkMode = (displayMode: number|boolean = -1) => {
    if (displayMode !== true && displayMode !== false) {
        displayMode = !document.documentElement.classList.contains('dark');
    }

    if (displayMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', displayMode ? 'dark' : 'light');
}

const defaultDarkModeCheck = () => {
    let displayMode: boolean;

    const changeMode = function () {
        if (displayMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    if (!localStorage.getItem('theme')) {
        // Sesuaikan dengan konfigurasi dark mode dari sistem.
        // eslint-disable-next-line
        displayMode = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

        // Buat item di localstorage
        localStorage.setItem('theme', displayMode ? 'dark' : 'light');
        changeMode();
    } else {
        // Sesuaikan dengan item yang ada di localstorage
        displayMode = localStorage.getItem('theme') === 'dark';
        changeMode();
    }
};

export { changeDarkMode, defaultDarkModeCheck };
