namespace Ticket_Management_System.Models;

public class Screen
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public int TheatreId { get; set; }
    public int TotalSeats { get; set; }

    public Theatre Theatre { get; set; } = null!;
    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
    public ICollection<Show> Shows { get; set; } = new List<Show>();
}
