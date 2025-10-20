// Move Clip to Media Start Time
// This script moves the selected clip to a timecode position based on its Media Start attribute

(function() {
    // Check if Premiere Pro is running
    if (app.project === null) {
        alert("Please open a project first.");
        return;
    }
    
    // Check if a sequence is active
    if (app.project.activeSequence === null) {
        alert("Please open a sequence first.");
        return;
    }
    
    // Get the active sequence
    var activeSequence = app.project.activeSequence;
    
    // Check if there's a clip selected
    if (activeSequence.getSelection().length === 0) {
        alert("Please select a clip in the timeline.");
        return;
    }
    
    // Get the selected clip
    var selectedClip = activeSequence.getSelection()[0];
    
    try {
        // Get the Media Start timecode
        var mediaStart = selectedClip.getComponentProperty("Media Start");
        
        if (!mediaStart) {
            alert("Cannot find Media Start property for the selected clip.");
            return;
        }
        
        // Convert the Media Start timecode to ticks
        var startTicks = timeCodeToTicks(mediaStart.toString());
        
        // Get current position of the clip
        var currentPosition = selectedClip.start.ticks;
        
        // Calculate the offset to move
        var offset = startTicks - currentPosition;
        
        // Move the clip to the new position
        selectedClip.move(offset);
        
        alert("Clip moved to Media Start timecode: " + mediaStart.toString());
    } catch (error) {
        alert("Error: " + error.message);
    }
    
    // Helper function to convert timecode to ticks
    function timeCodeToTicks(timecode) {
        // Parse the timecode (assuming format: HH:MM:SS:FF)
        var parts = timecode.split(':');
        var hours = parseInt(parts[0]);
        var minutes = parseInt(parts[1]);
        var seconds = parseInt(parts[2]);
        var frames = parseInt(parts[3]);
        
        // Get sequence framerate
        var frameRate = activeSequence.getSettings().videoFrameRate;
        
        // Calculate total frames
        var totalFrames = frames + (seconds * frameRate) + (minutes * 60 * frameRate) + (hours * 3600 * frameRate);
        
        // Convert to ticks (assuming standard Premiere ticks)
        return totalFrames * 254016000000 / frameRate;
    }
})();