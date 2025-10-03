// This is the new simplified version of the testimony maker tab
// We'll replace the existing two-column layout with a single column layout using BubbleInput

{activeTab === "testimony-maker" && (
  <div className="space-y-8">
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 pt-10 pb-10 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* H2 with explicit Tailwind classes for full customization */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          ✍️ Write your testimonial
        </h2>

        <div className="space-y-6">
          {/* Platform Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Choose Platform
            </label>
            <div className="relative" ref={platformDropdownRef}>
              <button
                onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                className="w-full p-3 rounded-xl border border-[#D5E7D5] focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white text-left flex items-center justify-between transition-all duration-200 hover:border-gray-300"
              >
                <div className="flex items-center gap-3">
                  {platforms[selectedPlatform].logo && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={platforms[selectedPlatform].logo} 
                        alt={platforms[selectedPlatform].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="text-gray-900 font-medium">
                    {platforms[selectedPlatform].name}
                  </span>
                  {!platforms[selectedPlatform].available && (
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${platformDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {platformDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5E7D5] rounded-xl shadow-lg z-50 overflow-hidden">
                  {Object.entries(platforms).map(([key, platform]) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (platform.available) {
                          setSelectedPlatform(key as Platform);
                          setPlatformDropdownOpen(false);
                        } else {
                          toast.info(`${platform.name} is coming soon! 🚀`);
                        }
                      }}
                      className={`w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 ${
                        !platform.available ? 'opacity-75 cursor-default' : 'cursor-pointer'
                      } ${selectedPlatform === key ? 'bg-green-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {platform.logo && (
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={platform.logo} 
                              alt={platform.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className={`font-medium ${
                          selectedPlatform === key && platform.available ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {platform.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!platform.available && (
                          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                            Coming Soon
                          </span>
                        )}
                        {selectedPlatform === key && platform.available && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Message Type Selection Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Type of Message
            </label>
            <div className="relative" ref={messageTypeDropdownRef}>
              <button
                onClick={() => setMessageTypeDropdownOpen(!messageTypeDropdownOpen)}
                className="w-full p-3 rounded-xl border border-[#D5E7D5] focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none bg-white text-left flex items-center justify-between transition-all duration-200 hover:border-gray-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{messageTypes[selectedMessageType].icon}</span>
                  <div>
                    <span className="text-gray-900 font-medium">
                      {messageTypes[selectedMessageType].name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {messageTypes[selectedMessageType].description}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${messageTypeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {messageTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D5E7D5] rounded-xl shadow-lg z-50 overflow-hidden">
                  {Object.entries(messageTypes).map(([key, messageType]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedMessageType(key as "text" | "image" | "text-image");
                        setMessageTypeDropdownOpen(false);
                        // Clear current inputs when switching types
                        if (key === "image") {
                          setCurrentMessage("");
                          setCurrentHighlights([]);
                        } else if (key === "text") {
                          setCurrentImages([]);
                        }
                      }}
                      className={`w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                        selectedMessageType === key ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{messageType.icon}</span>
                        <div>
                          <span className={`font-medium ${
                            selectedMessageType === key ? 'text-green-700' : 'text-gray-700'
                          }`}>
                            {messageType.name}
                          </span>
                          <p className="text-sm text-gray-500">
                            {messageType.description}
                          </p>
                        </div>
                      </div>
                      {selectedMessageType === key && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Text Input using BubbleInput - Only show for text and text-image types */}
          {(selectedMessageType === "text" || selectedMessageType === "text-image") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Type your testimonial message...
                </label>
                <TextExtractor 
                  onExtractedText={handleExtractedText}
                  className="flex-shrink-0"
                  compact={true}
                />
              </div>
              <div ref={testimonyTextareaRef}>
                <BubbleInput
                  ref={bubbleInputRef}
                  value={currentMessage}
                  onChange={handleMessageChange}
                  highlights={currentHighlights}
                  time={currentTime}
                  onTimeChange={setCurrentTime}
                  placeholder="Type your testimonial message here..."
                  className=""
                />
              </div>
            </div>
          )}

          {/* Image Upload - Only show for image and text-image types */}
          {(selectedMessageType === "image" || selectedMessageType === "text-image") && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {selectedMessageType === "image" ? "Upload the image" : "Insert image in message"}
              </label>
              <div className="flex items-center space-x-2 mb-6">
                <Button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  variant="outline"
                  className="rounded-xl border-2 border-[#D5E7D5] hover:border-green-500 shadow-md hover:shadow-lg transition-all duration-200 bg-white text-gray-700 hover:bg-green-50 font-medium"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
                {currentImages.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {currentImages.length} image{currentImages.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              {currentImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.preview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Simple time input for non-text message types */}
          {selectedMessageType === "image" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Pick a time
              </label>
              <div className="relative w-full">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" />
                <input
                  ref={timeInputRef}
                  type="time"
                  value={formatTimeForInput(currentTime)}
                  onChange={handleTimeChange}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D5E7D5] focus:border-green-500 focus:ring-green-500 focus:outline-none bg-white cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            {/* Add to Chat Button - Figma Style */}
            <div
              onClick={addMessage}
              className="flex-1 bg-[#04a444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[49px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]"
            >
              <div className="flex flex-row items-center justify-center relative size-full">
                <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-3 relative size-full">
                  <MessageCircle className="w-4 h-4 text-white" />
                  <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                    <p className="leading-[normal] whitespace-pre">Add to Chat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear All Button - Figma Style */}
            <div
              onClick={clearMessages}
              className="bg-[#ef4444] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[49px] cursor-pointer transition-all duration-200 hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]"
            >
              <div className="flex flex-row items-center justify-center relative size-full">
                <div className="box-border content-stretch flex gap-2.5 items-center justify-center px-4 py-3 relative size-full">
                  <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                    <p className="leading-[normal] whitespace-pre">Clear All</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      <Card className="p-6 pt-10 pb-6 bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 mt-8">
        <div className="flex justify-between items-center mb-4">
          {/* H2 with explicit Tailwind classes for full customization */}
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            👀 Live Preview
          </h2>
        </div>
        
        {/* Background Controls */}
        <div className="mb-4">
          {/* Material Design Radio Buttons */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-3 text-gray-800">
              Background Options
            </label>
            <div className="flex gap-6">
              {/* Add Background Option */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative radio-focus-ring material-ripple">
                  <input
                    type="radio"
                    name="background"
                    checked={showBackground}
                    onChange={() => setShowBackground(true)}
                    className="sr-only"
                  />
                  {/* Custom Radio Button */}
                  <div 
                    className={`
                      w-5 h-5 rounded-full border-2 transition-all duration-250 ease-in-out
                      flex items-center justify-center relative overflow-hidden
                      ${showBackground 
                        ? 'border-[#01A444] bg-white' 
                        : 'border-gray-400 bg-white group-hover:border-[#01A444]'
                      }
                    `}
                  >
                    {/* Inner dot with enhanced animation */}
                    <div 
                      className={`
                        w-2.5 h-2.5 rounded-full transition-all duration-250 ease-out
                        ${showBackground 
                          ? 'bg-[#01A444] scale-100 opacity-100' 
                          : 'bg-[#01A444] scale-0 opacity-0'
                        }
                      `}
                      style={{
                        transformOrigin: 'center',
                      }}
                    />
                  </div>
                </div>
                <span 
                  className={`
                    text-sm font-medium transition-all duration-200 ease-in-out
                    select-none
                    ${showBackground 
                      ? 'text-[#01A444] font-semibold' 
                      : 'text-gray-700 group-hover:text-[#01A444]'
                    }
                  `}
                >
                  Add background
                </span>
              </label>

              {/* No Background Option */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative radio-focus-ring material-ripple">
                  <input
                    type="radio"
                    name="background"
                    checked={!showBackground}
                    onChange={() => setShowBackground(false)}
                    className="sr-only"
                  />
                  {/* Custom Radio Button */}
                  <div 
                    className={`
                      w-5 h-5 rounded-full border-2 transition-all duration-250 ease-in-out
                      flex items-center justify-center relative overflow-hidden
                      ${!showBackground 
                        ? 'border-[#01A444] bg-white' 
                        : 'border-gray-400 bg-white group-hover:border-[#01A444]'
                      }
                    `}
                  >
                    {/* Inner dot with enhanced animation */}
                    <div 
                      className={`
                        w-2.5 h-2.5 rounded-full transition-all duration-250 ease-out
                        ${!showBackground 
                          ? 'bg-[#01A444] scale-100 opacity-100' 
                          : 'bg-[#01A444] scale-0 opacity-0'
                        }
                      `}
                      style={{
                        transformOrigin: 'center',
                      }}
                    />
                  </div>
                </div>
                <span 
                  className={`
                    text-sm font-medium transition-all duration-200 ease-in-out
                    select-none
                    ${!showBackground 
                      ? 'text-[#01A444] font-semibold' 
                      : 'text-gray-700 group-hover:text-[#01A444]'
                    }
                  `}
                >
                  No background
                </span>
              </label>
            </div>
          </div>

          {/* Background Color Controls - Only show when background is enabled */}
          {showBackground && (
            <div className="flex gap-2">
              {/* Background Color Picker */}
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1 text-gray-700">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-green-500"
                    placeholder="#efeae2"
                  />
                </div>
              </div>

              {/* Surprise Me Button */}
              <div className="flex-shrink-0">
                <label className="block text-xs font-medium mb-1 text-gray-700 opacity-0">
                  Action
                </label>
                <Button
                  onClick={() => {
                    const colors = [
                      '#c8a6a6',
                      '#c8b4a6',
                      '#c8c1a6',
                      '#c1c8a6',
                      '#b4c8a6',
                      '#a6c8a6',
                      '#a6c8b4',
                      '#a6c8c1',
                      '#a6c1c8',
                      '#a6b4c8',
                      '#a6a6c8',
                      '#b4a6c8',
                      '#c1a6c8',
                      '#c8a6c1',
                      '#c8a6b4'
                    ];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    setBackgroundColor(randomColor);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded border-purple-500 text-purple-600 hover:bg-purple-50"
                >
                  <Shuffle className="w-3 h-3 mr-1" />
                  Surprise Me
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Subtitle with instructions - only show when user has added messages */}
        {hasAddedFirstMessage && (
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
              💡 Tap a bubble to edit, delete, or move it.
            </div>
          </div>
        )}

        {/* Preview Container */}
        {showBackground ? (
          // Background Container - Outer container with user's selected background color
          <div 
            className="relative rounded-2xl overflow-hidden w-full mb-6 p-4 min-[601px]:p-10"
            style={{ 
              backgroundColor: backgroundColor
            }}
          >
            {/* Message Container - Inner WhatsApp container */}
            <div 
              ref={previewContainerRef}
              className="shadow-xl relative"
              style={{
                backgroundColor: '#efeae2',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {/* WhatsApp Background Pattern */}
              <div className="absolute inset-0">
                <WhatsappBackground />
              </div>

              {/* Content layer with message padding */}
              <div 
                className="relative z-10 px-3 pt-[35px] pb-[40px] overflow-x-auto"
                style={{
                  minHeight: '120px'
                }}
              >
                <div className="space-y-2 w-full">
                  {messages.map((message, index) => (
                    <DraggableMessage
                      key={message.id}
                      message={message}
                      index={index}
                      moveMessage={moveMessage}
                      onEdit={() => handleEditMessage(message)}
                      onDelete={() => handleDeleteMessage(message.id)}
                      containerRef={previewContainerRef}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // No Background - Direct message container
          <div className="w-full mb-6">
            <div 
              ref={previewContainerRef}
              className="shadow-xl relative rounded-2xl overflow-hidden"
              style={{
                backgroundColor: '#efeae2',
                borderRadius: '12px'
              }}
            >
              {/* WhatsApp Background Pattern */}
              <div className="absolute inset-0">
                <WhatsappBackground />
              </div>

              {/* Content layer with message padding */}
              <div 
                className="relative z-10 px-3 pt-[35px] pb-[40px] overflow-x-auto"
                style={{
                  minHeight: '120px'
                }}
              >
                <div className="space-y-2 w-full">
                  {messages.map((message, index) => (
                    <DraggableMessage
                      key={message.id}
                      message={message}
                      index={index}
                      moveMessage={moveMessage}
                      onEdit={() => handleEditMessage(message)}
                      onDelete={() => handleDeleteMessage(message.id)}
                      containerRef={previewContainerRef}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Figma Style with Drop Shadow */}
        <div className="flex gap-2 w-full">
          {/* Download Button - Figma Style */}
          <div
            onClick={handleDownload}
            className={`bg-[#3b82f6] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[48px] transition-all duration-200 ${
              hasAddedFirstMessage 
                ? 'cursor-pointer hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ width: '60%' }}
          >
            <div className="flex flex-row items-center justify-center relative size-full">
              <div className="box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative size-full">
                <Download className="w-4 h-4 text-white" />
                <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[12px] text-nowrap">
                  <p className="leading-[normal] whitespace-pre">Download as PNG</p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Now Button - Figma Style */}
          <div
            onClick={handleShare}
            className={`bg-[#eab308] relative rounded-[8px] shadow-[0px_4px_0px_0px_#000000] h-[48px] transition-all duration-200 ${
              hasAddedFirstMessage 
                ? 'cursor-pointer hover:shadow-[0px_6px_0px_0px_#000000] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_#000000] active:translate-y-[2px]' 
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ width: '40%' }}
          >
            <div className="flex flex-row items-center justify-center relative size-full">
              <div className="box-border content-stretch flex gap-2 items-center justify-center px-4 py-3 relative size-full">
                <Share2 className="w-4 h-4 text-gray-900" />
                <div className="font-semibold leading-[0] not-italic relative shrink-0 text-[#000000] text-[12px] text-nowrap">
                  <p className="leading-[normal] whitespace-pre">Share Now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
)}