namespace Ticket_Management_System.Models;

public class Theatre
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string City { get; set; } = null!;
    public string Address { get; set; } = null!;

    public ICollection<Screen> Screens { get; set; } = new List<Screen>();
}
