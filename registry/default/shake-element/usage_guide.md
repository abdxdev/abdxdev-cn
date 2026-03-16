import { ShakeElement, ShakeHandle } from "./shake-element";

  const shakeRef = useRef<ShakeHandle>(null)

                        <PopoverContent
                          className="w-auto max-w-[90vw] p-0 z-50"
                          align="start"
                          sideOffset={8}
                          onInteractOutside={(e) => {
                            e.preventDefault()
                            shakeRef.current?.shake()
                          }}
                          onEscapeKeyDown={(e) => {
                            e.preventDefault()
                            shakeRef.current?.shake()
                          }}
                        >
                          <ShakeElement ref={shakeRef}>
                            <CalendarAppointment
                              onConfirm={(date, time) => {
                                handleAppointmentConfirm(date, time)
                                setCalendarOpen(false)
                              }}
                              onCancel={() => setCalendarOpen(false)}
                            />
                          </ShakeElement>
                        </PopoverContent>