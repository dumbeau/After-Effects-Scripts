// Clip Markers to Sequence Markers
// This script finds all clip markers from source clips in the active sequence 
// and creates corresponding sequence markers

(function() {
    // Make sure a project is open
    
    if (app.project === null) {
        alert("Please open a project first.");
        return;
    }

    // Make sure we have an active sequence
    if (app.project.activeSequence === null) {
        alert("Please open a sequence first.");
        return;
    }

    var sequence = app.project.activeSequence;
    var totalMarkers = 0;

    

    try {
        // Process all video tracks
        processAllTracks(sequence.videoTracks);
        
        // Process all audio tracks
        processAllTracks(sequence.audioTracks);
        
        if (totalMarkers > 0) {
            alert("Successfully created " + totalMarkers + " sequence markers from clip markers.");
        } else {
            alert("No clip markers found in the sequence.");
        }
    } catch (error) {
        alert("Error: " + error.toString());
    }
    
    
    
    // Function to process all tracks of a specific type
    function processAllTracks(tracks) {
        for (var trackIndex = 0; trackIndex < tracks.numTracks; trackIndex++) {
            var track = tracks[trackIndex];
            
            // Loop through all clips in this track
            for (var clipIndex = 0; clipIndex < track.clips.numItems; clipIndex++) {
                var clip = track.clips[clipIndex];
                
                // Skip if there's no project item (can happen with synthetic clips like adjustment layers)
                if (!clip.projectItem) continue;
                
                // Get the markers from the source clip
                var markers = clip.projectItem.getMarkers();
                
                if (markers && markers.numMarkers > 0) {
                    // Information needed for time conversion
                    var clipSpeedRatio = 1/clip.getSpeed();
                    
                    var clipStartInSequence = clip.start.seconds*clipSpeedRatio;
                    var clipInPoint = clip.inPoint.seconds*clipSpeedRatio;
                    
                    // Get each marker and process it
                    var marker = markers.getFirstMarker();
                    while (marker) {
                        // Calculate marker position in the sequence
                        // Marker time relative to media start - clip in point + clip start in sequence
                        var markerTime = marker.start.seconds;           
                        var markerEndTime = marker.end.seconds;                       
                        
                        var sequenceMarkerTime = markerTime - clipInPoint + clipStartInSequence; 
                        
                        // Only add the marker if it falls within the clip's used range in the sequence
                        if (sequenceMarkerTime >= clipStartInSequence && 
                            sequenceMarkerTime <= clipStartInSequence + (clip.outPoint.seconds - clip.inPoint.seconds)) {
                            
                            // Create a new sequence marker at this position                            
                            var newMarker = sequence.markers.createMarker(sequenceMarkerTime);
                            if(markerEndTime != markerTime){
                                var sequenceMarkerEndTime = markerEndTime - clipInPoint + clipStartInSequence;
                                newMarker.end = sequenceMarkerEndTime;
                            }
                            
                            // Copy properties from clip marker to sequence marker
                            //newMarker.name = (clip.name || "Clip") + ": " + (marker.name || "Marker");                            
                            newMarker.name = marker.name || "";                            
                            newMarker.comments = marker.comments;
                            newMarker.setColorByIndex(marker.getColorByIndex());
                            
                            // Handle marker type if possible
                            if (marker.type !== undefined) {
                                newMarker.type = marker.type;
                            }
                            
                            totalMarkers++;
                        }
                        
                        // Move to the next marker
                        marker = markers.getNextMarker(marker);
                    }
                }
            }
        }
    }
})();