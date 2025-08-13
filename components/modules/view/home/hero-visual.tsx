<div className="relative">
							// Main Content Card
							<div className="relative mb-6 ml-auto w-80 rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-xl">
								<h3 className="mb-4 text-xl font-semibold">Fractional Ownership That Delivers Results</h3>
								<div className="h-48 rounded-xl bg-white/20 flex items-center justify-center">
									<span className="text-4xl">🏠</span>
								</div>
							</div>

							// Top Bubble
							<div className="absolute -top-4 right-32">
								<div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-lg border border-gray-200">
									<span className="text-green-500">✓</span>
									<span className="text-sm font-medium text-gray-700">Asset Verification</span>
								</div>
								// Dashed line to main card
								<div className="absolute top-full left-1/2 w-px h-8 border-l-2 border-dashed border-gray-300" />
							</div>

							// Left Cards
							<div className="absolute left-0 top-20 space-y-4">
								// Top-Tier Team Card
								<div className="w-64 rounded-2xl bg-white/90 p-4 shadow-lg border border-gray-200">
									<div className="text-3xl font-bold text-primary mb-2">+120</div>
									<div className="text-sm font-medium text-gray-700 mb-3">Premium Assets Available</div>
									<div className="flex -space-x-2">
										{['🏠', '🎨', '⚡', '🥇'].map((icon, i) => (
											<div key={i} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
												{icon}
											</div>
										))}
									</div>
								</div>
								// Dashed line to main card
								<div className="absolute top-1/2 right-0 w-16 h-px border-t-2 border-dashed border-gray-300" />

								// Performance Card
								<div className="w-64 rounded-2xl bg-white/90 p-4 shadow-lg border border-gray-200">
									<div className="text-sm font-medium text-gray-700 mb-3">Portfolio Performance</div>
									<div className="space-y-2">
										{[
											{ day: 'Mon', value: 1.2, height: 'h-8' },
											{ day: 'Tue', value: 1.8, height: 'h-12' },
											{ day: 'Wed', value: 2.1, height: 'h-16' },
											{ day: 'Thu', value: 1.9, height: 'h-14' },
											{ day: 'Fri', value: 2.7, height: 'h-20' },
											{ day: 'Sat', value: 2.3, height: 'h-18' },
											{ day: 'Sun', value: 2.0, height: 'h-15' }
										].map((bar, i) => (
											<div key={i} className="flex items-center gap-2">
												<div className={`w-4 ${bar.height} bg-gradient-to-t from-primary/60 to-primary rounded-sm`} />
												<span className="text-xs text-gray-500 w-8">{bar.day}</span>
												<span className="text-xs text-gray-700">{bar.value}K</span>
											</div>
										))}
									</div>
								</div>
								// Dashed line to main card
								<div className="absolute top-1/2 right-0 w-16 h-px border-t-2 border-dashed border-gray-300" />
							</div>

							// Bottom Cards
							<div className="absolute bottom-0 right-0 space-y-4">
								// Tip Card
								<div className="w-64 rounded-2xl bg-white/90 p-4 shadow-lg border border-gray-200">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-yellow-500 text-xl">💡</span>
										<span className="text-sm font-medium text-gray-700">Tip For Success</span>
									</div>
									<p className="text-xs text-gray-600">Diversify across asset classes and maintain a long-term perspective for optimal returns.</p>
								</div>
								// Dashed line to main card
								<div className="absolute top-1/2 left-0 w-16 h-px border-t-2 border-dashed border-gray-300" />

								// Social Platforms
								<div className="flex gap-3">
									{['📱', '💻', '🔗'].map((icon, i) => (
										<div key={i} className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-xl shadow-lg border border-gray-200">
											{icon}
										</div>
									))}
								</div>
								// Dashed line to main card
								<div className="absolute top-1/2 left-0 w-16 h-px border-t-2 border-dashed border-gray-300" />
							</div>
						</div>