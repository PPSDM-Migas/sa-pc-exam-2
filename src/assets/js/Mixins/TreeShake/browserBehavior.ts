const changeDarkMode = (displayMode: number|boolean = -1) => {
    if (displayMode !== true && displayMode !== false) {
        displayMode = !document.documentElement.classList.contains('dark');
    }

    if (displayMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', displayMode ? 'dark' : 'light');
}

export { changeDarkMode };
