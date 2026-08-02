(() => {
  const improvedImage = "./task-1-sugar-production-4k.png?v=20260802-2231";

  function replaceTaskImage() {
    const image = document.getElementById("taskImage");
    if (!image) return;
    if (!image.src.includes("task-1-sugar-production-4k.png")) {
      image.src = improvedImage;
    }
  }

  replaceTaskImage();

  const taskCopy = document.getElementById("taskCopy");
  if (taskCopy) {
    new MutationObserver(replaceTaskImage).observe(taskCopy, {
      childList: true,
      subtree: true
    });
  }
})();
