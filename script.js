const sections = document.querySelectorAll(
    "section, .project-card, .skill-card, .timeline-item"
);

sections.forEach(item => {
    item.classList.add("fade");
});

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
},{
    threshold:0.2
});

sections.forEach(item => {
    observer.observe(item);
});

